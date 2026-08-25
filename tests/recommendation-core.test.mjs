import test from "node:test";
import assert from "node:assert/strict";
import { rankCandidates } from "../server/recommendation/ranking.ts";
import { evaluateNoBuy } from "../server/recommendation/no-buy.ts";
import { buildRecommendationEvidence } from "../server/recommendation/evidence.ts";

const base = {
  brand: "Test",
  category: "cream",
  priceJpy: 2500,
  preferenceFit: 0.8,
  routineFit: 0.8,
  evidenceQuality: 1,
  priceFit: 1,
  noveltyFit: 0.6,
};

test("ranking is deterministic and uses stable id tie-breaker", () => {
  const input = [
    { ...base, id: "b", name: "B", concernFit: 0.9 },
    { ...base, id: "a", name: "A", concernFit: 0.9 },
  ];
  const first = rankCandidates(input);
  const second = rankCandidates(input);
  assert.deepEqual(first.map((x) => x.id), ["a", "b"]);
  assert.deepEqual(first, second);
});

test("ranking clamps invalid score inputs", () => {
  const [result] = rankCandidates([
    { ...base, id: "x", name: "X", concernFit: 9, preferenceFit: -1 },
  ]);
  assert.equal(result.concernFit, 1);
  assert.equal(result.preferenceFit, 0);
  assert.ok(result.finalScore >= 0 && result.finalScore <= 1);
});

test("no-buy triggers when owned role overlaps and benefit is low", () => {
  const result = evaluateNoBuy({
    ownedSameCategoryCount: 1,
    roleOverlapScore: 0.9,
    expectedBenefitScore: 0.2,
    routineComplexityPenalty: 0.2,
  });
  assert.equal(result.noBuy, true);
  assert.ok(result.reasons.length >= 2);
});

test("no-buy does not trigger from ingredient/category overlap alone", () => {
  const result = evaluateNoBuy({
    ownedSameCategoryCount: 1,
    roleOverlapScore: 0.81,
    expectedBenefitScore: 0.8,
    routineComplexityPenalty: 0.2,
  });
  assert.equal(result.noBuy, false);
});

test("evidence selects the top ranked product without re-ranking", () => {
  const candidates = rankCandidates([
    { ...base, id: "top", name: "Top", concernFit: 1 },
    { ...base, id: "other", name: "Other", concernFit: 0.5 },
  ]);
  const evidence = buildRecommendationEvidence({
    candidates,
    noBuy: { noBuy: false, reasons: [] },
  });
  assert.equal(evidence.decision, "recommend");
  assert.equal(evidence.selectedProductId, "top");
  assert.deepEqual(evidence.sourceProductIds, ["top", "other"]);
});

test("evidence emits no_buy without selecting a product", () => {
  const candidates = rankCandidates([
    { ...base, id: "top", name: "Top", concernFit: 1 },
  ]);
  const evidence = buildRecommendationEvidence({
    candidates,
    noBuy: { noBuy: true, reasons: ["手持ちで代替可能"] },
  });
  assert.equal(evidence.decision, "no_buy");
  assert.equal(evidence.selectedProductId, null);
  assert.deepEqual(evidence.reasons, ["手持ちで代替可能"]);
});

test("evidence emits insufficient_data for empty candidates", () => {
  const evidence = buildRecommendationEvidence({
    candidates: [],
    noBuy: { noBuy: false, reasons: [] },
  });
  assert.equal(evidence.decision, "insufficient_data");
  assert.equal(evidence.selectedProductId, null);
});
