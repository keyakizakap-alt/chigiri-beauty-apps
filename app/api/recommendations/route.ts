import { officialProducts } from "@/data/official-products";
import { buildRecommendation } from "@/server/recommendation";
import { privateJson, requestOwner } from "@/server/request-owner";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const owner = await requestOwner(request);
  let body: { input?: string; ownedProductIds?: string[] };

  try {
    body = await request.json();
  } catch {
    return privateJson({ error: "入力内容を確認してください。" }, 400, owner.setCookie);
  }

  const input = body.input?.trim() ?? "";
  if (!input || input.length > 1200) {
    return privateJson({ error: "入力内容を確認してください。" }, 400, owner.setCookie);
  }

  const ownedIds = (body.ownedProductIds ?? [])
    .filter((value): value is string => typeof value === "string")
    .slice(0, 50);
  const ownedProducts = officialProducts.filter((product) => ownedIds.includes(product.id));
  const result = buildRecommendation({ text: input, ownedProducts });

  return privateJson({
    context: result.context,
    candidates: result.candidates.slice(0, 5),
    evidence: result.evidence,
  }, 200, owner.setCookie);
}
