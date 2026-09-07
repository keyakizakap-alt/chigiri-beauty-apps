export class InputError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function mutationGuard(request) {
  const origin = request.headers.get("origin");
  if (request.headers.get("sec-fetch-site") === "cross-site" || (origin && origin !== new URL(request.url).origin)) {
    return Response.json({ error: "この操作はアプリから実行してください。" }, { status: 403 });
  }
  return null;
}

export async function readJson(request, maxBytes = 64 * 1024) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new InputError("JSON形式で送信してください。", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new InputError("入力がありません。");
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { await reader.cancel(); throw new InputError("入力が大きすぎます。", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new InputError("入力を確認してください。"); }
}

export function validChatBody(body) {
  const object = (x) => x !== null && typeof x === "object" && !Array.isArray(x);
  const strings = (x, max) => x === undefined || (Array.isArray(x) && x.length <= max && x.every(v => typeof v === "string"));
  return object(body)
    && ["stage", "specialist", "input"].every(k => body[k] === undefined || typeof body[k] === "string")
    && strings(body.images, 2) && strings(body.ownedProductIds, 50)
    && (body.history === undefined || (Array.isArray(body.history) && body.history.length <= 20 && body.history.every(m => object(m) && typeof m.text === "string" && ["user", "assistant"].includes(m.role))))
    && (body.conditions === undefined || (Array.isArray(body.conditions) && body.conditions.length <= 5 && body.conditions.every(object)))
    && (body.memory === undefined || (object(body.memory) && strings(body.memory.facts, 20) && strings(body.memory.knownKeys, 12) && strings(body.memory.askedKeys, 12)));
}

// Atomic UPSERT prevents concurrent requests from exceeding the same window.
export const reserveUsageSql = `INSERT INTO usage_limits (bucket, window_start, used)
  VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET
  window_start = excluded.window_start,
  used = CASE WHEN usage_limits.window_start = excluded.window_start THEN usage_limits.used + 1 ELSE 1 END
  WHERE usage_limits.window_start != excluded.window_start OR usage_limits.used < ?
  RETURNING used`;
