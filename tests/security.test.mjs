import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@libsql/client";
import { readJson, mutationGuard, validChatBody, reserveUsageSql } from "../server/request-security.mjs";

test("malformed chat structures are rejected before model or image access", () => {
  for (const body of [null, [], { input: 1 }, { history: {} }, { history: [null] }, { memory: { facts: "oops" } }, { conditions: [null] }, { images: Array(3).fill("/api/uploads?id=x") }]) assert.equal(validChatBody(body), false);
  assert.equal(validChatBody({ input: "乾燥する", history: [{ role: "user", text: "相談" }], memory: { facts: [] } }), true);
});
test("cross-site mutations are blocked; same-origin and server clients remain usable", () => {
  const url = "https://chigiri.example/api/chat";
  assert.equal(mutationGuard(new Request(url, { headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal(mutationGuard(new Request(url, { headers: { "sec-fetch-site": "cross-site" } })).status, 403);
  assert.equal(mutationGuard(new Request(url, { headers: { origin: "https://chigiri.example" } })), null);
});
test("streamed oversized JSON is rejected without trusting content-length", async () => {
  const req = new Request("https://app.local", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ x: "a".repeat(200) }) });
  await assert.rejects(readJson(req, 100), error => error.status === 413);
  const valid = new Request("https://app.local", { method: "POST", headers: { "content-type": "application/json" }, body: '{"input":"相談"}' });
  assert.deepEqual(await readJson(valid), { input: "相談" });
});
test("atomic quota allows exactly the cap under concurrency and resets next window", async () => {
  const db = createClient({ url: ":memory:" });
  try {
    await db.execute("CREATE TABLE usage_limits (bucket TEXT PRIMARY KEY, window_start INTEGER, used INTEGER)");
    const results = await Promise.all(Array.from({ length: 30 }, () => db.execute({ sql: reserveUsageSql, args: ["user:one", 60_000, 12] })));
    assert.equal(results.filter(r => r.rows.length).length, 12);
    assert.equal((await db.execute({ sql: reserveUsageSql, args: ["user:two", 60_000, 12] })).rows.length, 1);
    assert.equal((await db.execute({ sql: reserveUsageSql, args: ["user:one", 120_000, 12] })).rows[0].used, 1);
  } finally { db.close(); }
});
