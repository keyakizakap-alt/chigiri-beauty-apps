import type { VerifiedProduct } from "@/data/official-products";
import { extractConsultationContext } from "@/server/context/extractor";
import { retrieveCandidateProducts } from "./candidate-retrieval";
import { rankCandidates } from "./ranking";
import { evaluateNoBuy } from "./no-buy";
import { buildRecommendationEvidence } from "./evidence";
import type { RecommendationEvidence } from "./types";

export type RecommendationPipelineResult = {
  context: ReturnType<typeof extractConsultationContext>;
  candidates: ReturnType<typeof rankCandidates>;
  evidence: RecommendationEvidence;
};

function roleOverlap(topCategory: string | undefined, ownedProducts: VerifiedProduct[]) {
  if (!topCategory || ownedProducts.length === 0) return 0;
  return ownedProducts.some((product) => product.category === topCategory) ? 0.9 : 0.2;
}

export function buildRecommendation(input: {
  text: string;
  ownedProducts: VerifiedProduct[];
}): RecommendationPipelineResult {
  const context = extractConsultationContext(input.text);
  const candidates = rankCandidates(retrieveCandidateProducts(context, input.ownedProducts));
  const top = candidates[0];
  const ownedSameCategoryCount = top
    ? input.ownedProducts.filter((product) => product.category === top.category).length
    : 0;

  const noBuy = evaluateNoBuy({
    ownedSameCategoryCount,
    roleOverlapScore: roleOverlap(top?.category, input.ownedProducts),
    expectedBenefitScore: top?.concernFit ?? 0,
    routineComplexityPenalty: Math.min(1, input.ownedProducts.length / 8),
  });

  const insufficientData = context.concerns.length === 0 || candidates.length === 0;
  const evidence = buildRecommendationEvidence({ candidates, noBuy, insufficientData });

  return { context, candidates, evidence };
}
