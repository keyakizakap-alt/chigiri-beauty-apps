import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the production metadata and Japanese document language", async () => {
  const layout = await readFile(new URL("../app/layout.tsx", import.meta.url), "utf8");
  assert.match(layout, /title:\s*"CHIGIRI Beauty"/);
  assert.match(layout, /<html lang="ja">/);
});
