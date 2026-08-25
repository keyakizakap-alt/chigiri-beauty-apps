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

test("does not turn unrelated category mentions into exclusions", () => {
  const context = extractConsultationContext("化粧水は使っている。乾燥するけど美容液はいらない");
  assert.ok(context.requestedCategories.includes("lotion"));
  assert.ok(context.excludedCategories.includes("serum"));
});

test("reconstructs context when latest turn is only an acknowledgement", () => {
  const context = extractConsultationContext("最近乾燥する\nベタつくのは嫌\n3000円以内\nお願いします");
  assert.ok(context.concerns.includes("dryness"));
  assert.ok(context.preferences.includes("non_sticky"));
  assert.equal(context.budgetJpy, 3000);
});

test("marks missing concern instead of inventing one", () => {
  const context = extractConsultationContext("おすすめをお願いします");
  assert.deepEqual(context.concerns, []);
  assert.ok(context.missingInformation.includes("concern"));
});
