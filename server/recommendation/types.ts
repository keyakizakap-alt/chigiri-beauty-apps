export type EvidenceLevel = "high" | "medium" | "low" | "unknown";

export type ConsultationContext = {
  concerns: string[];
  preferences: string[];
  budgetJpy: number | null;
  requestedCategories: string[];
  excludedCategories: string[];
  avoidIngredients: string[];
  mentionedProducts: string[];
  missingInformation: string[];
};

export type CandidateProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  priceJpy: number | null;
  concernFit: number;
  preferenceFit: number;
  routineFit: number;
  evidenceQuality: number;
  priceFit: number;
  noveltyFit: number;
};

export type CandidateScore = CandidateProduct & {
  finalScore: number;
  rejectedReasons: string[];
};

export type RecommendationDecision = "recommend" | "no_buy" | "insufficient_data";

export type RecommendationEvidence = {
  recommendationId: string;
  decision: RecommendationDecision;
  selectedProductId: string | null;
  reasons: string[];
  rejected: Array<{ productId: string; reason: string }>;
  sourceProductIds: string[];
};
