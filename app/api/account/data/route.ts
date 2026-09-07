import { ensureAppStorage, getSqliteClient } from "@/db";
import { privateJson, requestOwner } from "@/server/request-owner";
import { mutationGuard } from "@/server/request-security.mjs";

export async function GET(request: Request) {
  const owner = await requestOwner(request);
  try {
    await ensureAppStorage();
    const client = getSqliteClient();
    const results = await client.batch([
      { sql: "SELECT payload_json FROM chat_sessions WHERE owner_key = ?", args: [owner.key] },
      { sql: "SELECT payload_json FROM beauty_check_ins WHERE owner_key = ?", args: [owner.key] },
      { sql: "SELECT id, file_name, content_type, byte_size, created_at FROM uploaded_assets WHERE owner_key = ?", args: [owner.key] },
    ], "read");
    const response = privateJson({
      exportedAt: new Date().toISOString(),
      consultations: results[0].rows.map(row => JSON.parse(String(row.payload_json))),
      conditions: results[1].rows.map(row => JSON.parse(String(row.payload_json))),
      images: results[2].rows.map(row => ({ ...row, url: `/api/uploads?id=${encodeURIComponent(String(row.id))}` })),
    }, 200, owner.setCookie);
    response.headers.set("Content-Disposition", 'attachment; filename="chigiri-data.json"');
    return response;
  } catch { return privateJson({ error: "データを取得できませんでした。時間をおいて再度お試しください。" }, 503, owner.setCookie); }
}

// Clear consultation text only. Asset/condition deletion remains available in the app.
// Tombstones block old tabs and offline outboxes from restoring deleted conversations.
export async function DELETE(request: Request) {
  const forbidden = mutationGuard(request);
  if (forbidden) return forbidden;
  if (request.headers.get("x-chigiri-confirm") !== "delete-consultations") return privateJson({ error: "削除の確認が必要です。" }, 400, null);
  const owner = await requestOwner(request);
  try {
    await ensureAppStorage();
    await getSqliteClient().batch([
      { sql: "INSERT OR IGNORE INTO deleted_chat_sessions (owner_key, id) SELECT owner_key, id FROM chat_sessions WHERE owner_key = ?", args: [owner.key] },
      { sql: "DELETE FROM chat_sessions WHERE owner_key = ?", args: [owner.key] },
    ], "write");
    return privateJson({ deleted: true }, 200, owner.setCookie);
  } catch { return privateJson({ error: "削除できませんでした。時間をおいて再度お試しください。" }, 503, owner.setCookie); }
}
