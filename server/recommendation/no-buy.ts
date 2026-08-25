export type NoBuyInput = {
  ownedSameCategoryCount: number;
  roleOverlapScore: number;
  expectedBenefitScore: number;
  routineComplexityPenalty: number;
};

export type NoBuyDecision = {
  noBuy: boolean;
  reasons: string[];
};

export function evaluateNoBuy(input: NoBuyInput): NoBuyDecision {
  const reasons: string[] = [];
  const redundant = input.ownedSameCategoryCount >= 1 && input.roleOverlapScore >= 0.8;
  const lowBenefit = input.expectedBenefitScore < 0.35;
  const complexityRisk = input.routineComplexityPenalty >= 0.7;

  if (input.ownedSameCategoryCount >= 1) reasons.push("同カテゴリの商品を現在使用中");
  if (input.roleOverlapScore >= 0.8) reasons.push("手持ち商品との役割差が小さい");
  if (lowBenefit) reasons.push("新規追加による期待改善幅が小さい");
  if (complexityRisk) reasons.push("ルーティン複雑化の負担が大きい");

  return {
    noBuy: redundant && (lowBenefit || complexityRisk),
    reasons,
  };
}
