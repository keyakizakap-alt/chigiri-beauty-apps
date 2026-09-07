import Stripe from "stripe";
import { ensureAppStorage, getSqliteClient } from "@/db";

export function legalLinks() {
  const safe = (value: string | undefined) => {
    try { const url = new URL(value ?? ""); return url.protocol === "https:" ? url.href : null; } catch { return null; }
  };
  return { terms: safe(process.env.TERMS_URL), privacy: safe(process.env.PRIVACY_URL), commerce: safe(process.env.COMMERCE_URL) };
}
export function billingConfigured() {
  const links = legalLinks();
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && links.terms && links.privacy && links.commerce && process.env.APP_URL?.startsWith("https://"));
}
export function stripeClient() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { timeout: 10_000, maxNetworkRetries: 1 });
}
export async function customerId(owner: string) {
  await ensureAppStorage();
  const result = await getSqliteClient().execute({ sql: "SELECT customer_id FROM billing_customers WHERE owner_key = ?", args: [owner] });
  return result.rows[0] ? String(result.rows[0].customer_id) : null;
}
export async function currentSubscriptions(customer: string) {
  // Read current provider state: forged success URLs and delayed events cannot grant access.
  const result = await stripeClient().subscriptions.list({ customer, status: "all", limit: 100 });
  return result.data.filter(s => s.items.data.some(item => item.price.id === process.env.STRIPE_PRICE_ID));
}
export async function paidMember(owner: string) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID || !owner.startsWith("user:")) return false;
  const customer = await customerId(owner);
  if (!customer) return false;
  return (await currentSubscriptions(customer)).some(s => s.status === "active" || s.status === "trialing");
}
