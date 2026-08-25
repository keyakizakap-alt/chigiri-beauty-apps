import { officialProducts, type VerifiedProduct } from "@/data/official-products";
import type { CandidateProduct, ConsultationContext } from "./types";

const concernKeywords: Record<string, string[]> = {
  dryness: ["うるおい", "保湿", "乾燥", "セラミド", "ヒアルロン"],
  acne: ["ニキビ", "肌荒れ", "薬用", "皮脂"],
  sensitive: ["敏感", "低刺激", "肌荒れ", "セラミド"],
  pores: ["毛穴", "皮脂", "角質"],
  oiliness: ["皮脂", "べたつき", "さっぱり", "軽い"],
  hair_damage: ["補修", "ダメージ", "熱"],
  frizz: ["広がり", "うねり", "まとまり"],
};

function productText(product: VerifiedProduct) {
  return [
    product.brand,
    product.name,
    ...product.claims,
    ...product.ingredientHighlights,
    ...(product.recommendationTags ?? []),
  ].join(" ").toLowerCase();
}

function ratio(matches: number, total: number, fallback = 0.5) {
  if (total <= 0) return fallback;
  return Math.max(0, Math.min(1, matches / total));
}

function concernFit(product: VerifiedProduct, context: ConsultationContext) {
  const text = productText(product);
  let matched = 0;
  for (const concern of context.concerns) {
    const words = concernKeywords[concern] ?? [concern];
    if (words.some((word) => text.includes(word.toLowerCase()))) matched += 1;
  }
  return ratio(matched, context.concerns.length, 0.45);
}

function preferenceFit(product: VerifiedProduct, context: ConsultationContext) {
  if (context.preferences.length === 0) return 0.5;
  const text = productText(product);
  let matched = 0;
  for (const preference of context.preferences) {
    if (preference === "non_sticky" && /べたつきにくい|さっぱり|軽い|みずみずしい/.test(text)) matched += 1;
    else if (preference === "moist" && /しっとり|うるおい|保湿/.test(text)) matched += 1;
    else if (preference === "lightweight" && /軽い|さっぱり|みずみずしい/.test(text)) matched += 1;
    else if (preference === "fragrance_free" && /無香料|香料不使用/.test(text)) matched += 1;
  }
  return ratio(matched, context.preferences.length, 0.35);
}

function priceFit(product: VerifiedProduct, context: ConsultationContext) {
  if (context.budgetJpy === null) return 0.6;
  if (product.price === null) return 0.35;
  if (product.price > context.budgetJpy) return 0;
  return Math.max(0.5, 1 - product.price / Math.max(context.budgetJpy, 1) * 0.4);
}

function ingredientSet(product: VerifiedProduct) {
  return new Set(product.ingredientHighlights.map((v) => v.toLowerCase()));
}

function noveltyFit(product: VerifiedProduct, ownedProducts: VerifiedProduct[]) {
  if (ownedProducts.length === 0) return 0.7;
  const current = ingredientSet(product);
  if (current.size === 0) return 0.5;
  let maxOverlap = 0;
  for (const owned of ownedProducts) {
    const other = ingredientSet(owned);
    const overlap = [...current].filter((value) => other.has(value)).length / current.size;
    maxOverlap = Math.max(maxOverlap, overlap);
  }
  return 1 - maxOverlap;
}

export function retrieveCandidateProducts(context: ConsultationContext, ownedProducts: VerifiedProduct[]): CandidateProduct[] {
  const ownedIds = new Set(ownedProducts.map((product) => product.id));
  return officialProducts
    .filter((product) => !ownedIds.has(product.id))
    .filter((product) => !context.excludedCategories.includes(product.category))
    .filter((product) => context.requestedCategories.length === 0 || context.requestedCategories.includes(product.category))
    .filter((product) => context.budgetJpy === null || product.price === null || product.price <= context.budgetJpy)
    .map((product) => ({
      id: product.id,
      brand: product.brand,
      name: product.name,
      category: product.category,
      priceJpy: product.price,
      concernFit: concernFit(product, context),
      preferenceFit: preferenceFit(product, context),
      routineFit: ownedProducts.some((owned) => owned.category === product.category) ? 0.35 : 0.8,
      evidenceQuality: product.verificationStatus === "official_verified" ? 1 : 0,
      priceFit: priceFit(product, context),
      noveltyFit: noveltyFit(product, ownedProducts),
    }))
    .filter((candidate) => candidate.concernFit >= 0.35)
    .slice(0, 50);
}
