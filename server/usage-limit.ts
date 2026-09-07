import { paidMember } from "@/server/billing";
import { ensureAppStorage, getSqliteClient } from "@/db";
import { privateJson, requestOwner } from "@/server/request-owner";
import { reserveUsageSql } from "@/server/request-security.mjs";

function limit(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : fallback;
}

export async function checkUsage(request: Request, operation: "chat" | "upload") {
  const owner = await requestOwner(request);
  try {
    await ensureAppStorage();
    const now = Date.now();
    const paid = operation === "chat" && await paidMember(owner.key);
    const windows = [
      { bucket: `${operation}:global`, duration: 86_400_000, cap: limit(process.env.DAILY_REQUEST_LIMIT, 1000) },
      { bucket: `${operation}:${owner.key}:minute`, duration: 60_000, cap: operation === "chat" ? 12 : 5 },
      { bucket: `${operation}:${owner.key}:day`, duration: 86_400_000, cap: paid ? 500 : owner.key.startsWith("user:") ? 100 : 30 },
    ];
    for (const { bucket, duration, cap } of windows) {
      const windowStart = Math.floor(now / duration) * duration;
      const result = await getSqliteClient().execute({ sql: reserveUsageSql, args: [bucket, windowStart, cap] });
      if (!result.rows.length) {
        const response = privateJson({ error: "利用上限に達しました。時間をおいてお試しください。" }, 429, owner.setCookie);
        response.headers.set("Retry-After", String(Math.ceil((windowStart + duration - now) / 1000)));
        return { owner, response };
      }
    }
    return { owner, response: null };
  } catch {
    // Fail closed: a database outage must not permit unmetered upstream calls.
    return { owner, response: privateJson({ error: "現在ご利用状況を確認できません。少し時間をおいてお試しください。" }, 503, owner.setCookie) };
  }
}
