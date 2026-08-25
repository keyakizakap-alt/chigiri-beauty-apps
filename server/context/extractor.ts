import type { ConsultationContext } from "@/server/recommendation/types";

const concernPatterns: Array<[string, RegExp]> = [
  ["dryness", /乾燥|つっぱ|カサつ|かさつ|粉ふき/],
  ["acne", /ニキビ|吹き出物/],
  ["sensitive", /敏感|しみる|刺激/],
  ["pores", /毛穴/],
  ["oiliness", /皮脂|テカリ|べたつき|ベタつき/],
  ["hair_damage", /ダメージ|枝毛|切れ毛/],
  ["frizz", /広がり|うねり/],
];

const preferencePatterns: Array<[string, RegExp]> = [
  ["non_sticky", /べたつ(かない|きにくい)|ベタつ(かない|きにくい)|ベタつくのは嫌|べたつくのは嫌|さっぱり/],
  ["moist", /しっとり|保湿感/],
  ["fragrance_free", /無香料|香りなし|香りが苦手/],
  ["lightweight", /軽い|軽め|みずみずしい/],
];

const categoryPatterns: Array<[string, RegExp]> = [
  ["lotion", /化粧水|ローション|トナー/],
  ["serum", /美容液|セラム/],
  ["moisturizer", /乳液|クリーム|保湿剤/],
  ["cleanser", /洗顔|クレンジング/],
  ["sunscreen", /日焼け止め|UV/],
  ["hair_shampoo", /シャンプー/],
  ["hair_treatment", /トリートメント|ヘアマスク/],
  ["body_moisturizer", /ボディクリーム|ボディミルク/],
  ["lip_color", /リップ|口紅/],
];

function unique(values: string[]) {
  return [...new Set(values)];
}

function extractBudget(text: string) {
  const direct = text.match(/(?:予算|以内|まで|以下)?\s*([1-9][0-9,]{2,6})\s*円/);
  if (!direct) return null;
  const value = Number(direct[1].replaceAll(",", ""));
  return Number.isFinite(value) && value >= 100 && value <= 200000 ? value : null;
}

function categoryIntent(source: string, pattern: RegExp) {
  const lines = source.split(/\n|。|！|!|？|\?/).map((line) => line.trim()).filter(Boolean);
  let requested = false;
  let excluded = false;
  for (const line of lines) {
    if (!pattern.test(line)) continue;
    if (/(?:いらない|不要|以外|じゃない|ではない|避けたい|除外)/.test(line)) excluded = true;
    else requested = true;
  }
  return { requested, excluded };
}

export function extractConsultationContext(text: string): ConsultationContext {
  const source = text.trim().slice(0, 2400);
  const concerns = concernPatterns.filter(([, pattern]) => pattern.test(source)).map(([value]) => value);
  const preferences = preferencePatterns.filter(([, pattern]) => pattern.test(source)).map(([value]) => value);
  const requestedCategories: string[] = [];
  const excludedCategories: string[] = [];
  for (const [category, pattern] of categoryPatterns) {
    const intent = categoryIntent(source, pattern);
    if (intent.excluded) excludedCategories.push(category);
    else if (intent.requested) requestedCategories.push(category);
  }
  const budgetJpy = extractBudget(source);
  const missingInformation: string[] = [];

  if (concerns.length === 0) missingInformation.push("concern");
  if (budgetJpy === null) missingInformation.push("budget");

  return {
    concerns: unique(concerns),
    preferences: unique(preferences),
    budgetJpy,
    requestedCategories: unique(requestedCategories),
    excludedCategories: unique(excludedCategories),
    avoidIngredients: [],
    mentionedProducts: [],
    missingInformation,
  };
}
