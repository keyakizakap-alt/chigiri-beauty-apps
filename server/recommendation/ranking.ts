import type { CandidateProduct, CandidateScore } from "./types";

const WEIGHTS = {
  concernFit: 0.3,
  preferenceFit: 0.2,
  routineFit: 0.2,
  evidenceQuality: 0.15,
  priceFit: 0.1,
  noveltyFit: 0.05,
} as const;

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function scoreCandidate(candidate: CandidateProduct): CandidateScore {
  const normalized = {
    concernFit: clamp01(candidate.concernFit),
    preferenceFit: clamp01(candidate.preferenceFit),
    routineFit: clamp01(candidate.routineFit),
    evidenceQuality: clamp01(candidate.evidenceQuality),
    priceFit: clamp01(candidate.priceFit),
    noveltyFit: clamp01(candidate.noveltyFit),
  };

  const finalScore =
    normalized.concernFit * WEIGHTS.concernFit +
    normalized.preferenceFit * WEIGHTS.preferenceFit +
    normalized.routineFit * WEIGHTS.routineFit +
    normalized.evidenceQuality * WEIGHTS.evidenceQuality +
    normalized.priceFit * WEIGHTS.priceFit +
    normalized.noveltyFit * WEIGHTS.noveltyFit;

  return {
    ...candidate,
    ...normalized,
    finalScore: Number(finalScore.toFixed(4)),
    rejectedReasons: [],
  };
}

export function rankCandidates(candidates: CandidateProduct[]): CandidateScore[] {
  return candidates
    .map(scoreCandidate)
    .sort((a, b) => b.finalScore - a.finalScore || a.id.localeCompare(b.id));
}
