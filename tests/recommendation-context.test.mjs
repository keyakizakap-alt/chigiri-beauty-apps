import test from "node:test";
import assert from "node:assert/strict";
import { extractConsultationContext } from "../server/context/extractor.ts";

test("extracts concern preference and budget", () => {
  const context = extractConsultationContext("最近乾燥する。ベタつきにくいものがよくて3000円以内がいい");
  assert.ok(context.concerns.includes("dryness"));
  assert.ok(context.preferences.includes("non_sticky"));
  assert.equal(context.budgetJpy, 3000);
});

test("treats explicitly rejected category as exclusion", () => {
  const context = extractConsultationContext("乾燥するけど化粧水じゃない方がいい");
  assert.ok(context.concerns.includes("dryness"));
  assert.ok(context.excludedCategories.includes("lotion"));
  assert.equal(context.requestedCategories.includes("lotion"), false);
});

test("marks missing concern instead of inventing one", () => {
  const context = extractConsultationContext("おすすめをお願いします");
  assert.deepEqual(context.concerns, []);
  assert.ok(context.missingInformation.includes("concern"));
});
