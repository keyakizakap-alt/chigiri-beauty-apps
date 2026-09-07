import { billingConfigured, currentSubscriptions, customerId, stripeClient } from "@/server/billing";
import { getAccountUserFromRequest } from "@/server/account-auth";
import { privateJson, requestOwner } from "@/server/request-owner";
import { mutationGuard, readJson } from "@/server/request-security.mjs";
import { getSqliteClient } from "@/db";

export async function POST(request: Request) {
  const forbidden = mutationGuard(request);
  if (forbidden) return forbidden;
  const user = await getAccountUserFromRequest(request);
  if (!user) return privateJson({ error: "Googleでログインしてください。" }, 401, null);
  if (!billingConfigured()) return privateJson({ error: "有料プランは準備中です。" }, 503, null);
  let action: string;
  try {
    const body = await readJson(request, 1024);
    if (!body || !["checkout", "portal"].includes(body.action)) throw new Error();
    action = body.action;
  } catch { return privateJson({ error: "操作を確認してください。" }, 400, null); }
  const owner = await requestOwner(request);
  try {
    const stripe = stripeClient();
    let customer = await customerId(owner.key);
    if (!customer && action === "portal") return privateJson({ error: "契約はまだありません。" }, 404, null);
    if (!customer) {
      const created = await stripe.customers.create({ email: user.email, metadata: { owner: owner.key } }, { idempotencyKey: `chigiri-customer:${owner.key}` });
      await getSqliteClient().execute({ sql: "INSERT OR IGNORE INTO billing_customers (owner_key, customer_id) VALUES (?, ?)", args: [owner.key, created.id] });
      customer = (await customerId(owner.key))!;
    }
    const returnUrl = new URL("/settings", process.env.APP_URL).href;
    const subscriptions = await currentSubscriptions(customer);
    if (action === "portal" || subscriptions.some(s => !["canceled", "incomplete_expired"].includes(s.status))) {
      const portal = await stripe.billingPortal.sessions.create({ customer, return_url: returnUrl });
      return privateJson({ url: portal.url }, 200, null);
    }
    const recent = await stripe.checkout.sessions.list({ customer, limit: 100 });
    const previous = recent.data.find(s => s.mode === "subscription" && s.metadata?.chigiri_price === process.env.STRIPE_PRICE_ID);
    const existing = recent.data.find(s => s.status === "open" && s.mode === "subscription" && s.metadata?.chigiri_price === process.env.STRIPE_PRICE_ID);
    if (existing?.url) return privateJson({ url: existing.url }, 200, null);
    const session = await stripe.checkout.sessions.create({
      customer, mode: "subscription", locale: "ja",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      metadata: { chigiri_price: process.env.STRIPE_PRICE_ID! },
      success_url: returnUrl, cancel_url: returnUrl,
    }, { idempotencyKey: `checkout:${customer}:${previous?.id ?? "initial"}` });
    return privateJson({ url: session.url }, 200, null);
  } catch { return privateJson({ error: "契約情報を確認できませんでした。少し時間をおいてお試しください。" }, 503, null); }
}
