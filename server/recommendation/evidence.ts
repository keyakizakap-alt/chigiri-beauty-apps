import { randomUUID } from "node:crypto";
import type { CandidateScore, RecommendationEvidence } from "./types";
import type { NoBuyDecision } from "./no-buy";

type BuildEvidenceInput = {
  candidates: CandidateScore[];
  noBuy: NoBuyDecision;
  insufficientData?: boolean;
};

export function buildRecommendationEvidence(input: BuildEvidenceInput): RecommendationEvidence {
  const recommendationId = randomUUID();

  if (input.insufficientData || input.candidates.length === 0) {
    return {
      recommendationId,
      decision: "insufficient_data",
      selectedProductId: null,
      reasons: ["信頼できる条件または候補情報が不足しています"],
      rejected: [],
      sourceProductIds: [],
    };
  }

  if (input.noBuy.noBuy) {
    return {
      recommendationId,
      decision: "no_buy",
      selectedProductId: null,
      reasons: input.noBuy.reasons,
      rejected: input.candidates.map((candidate) => ({
        productId: candidate.id,
        reason: "購入不要判定を優先",
      })),
      sourceProductIds: input.candidates.map((candidate) => candidate.id),
    };
  }

  const [selected, ...rest] = input.candidates;
  const reasons = [
    "相談条件に対する総合スコアが最も高い",
    `総合スコア ${selected.finalScore.toFixed(4)}`,
  ];

  return {
    recommendationId,
    decision: "recommend",
    selectedProductId: selected.id,
    reasons,
    rejected: rest.map((candidate) => ({
      productId: candidate.id,
      reason: `総合スコア ${candidate.finalScore.toFixed(4)} で選択候補より低い`,
    })),
    sourceProductIds: input.candidates.map((candidate) => candidate.id),
  };
}
