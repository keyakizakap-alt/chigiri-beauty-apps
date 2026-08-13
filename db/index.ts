import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

let client: Client | null = null;
let storageReady: Promise<void> | null = null;

export function getSqliteClient() {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL?.trim();
    if (!url && process.env.NODE_ENV === "production") {
      throw new Error("TURSO_DATABASE_URL is required in production.");
    }
    client = createClient({
      url: url || "file:local.db",
      authToken: process.env.TURSO_AUTH_TOKEN?.trim() || undefined,
    });
  }
  return client;
}

export async function getDb() {
  await ensureAppStorage();
  return drizzle(getSqliteClient(), { schema });
}

export async function ensureAppStorage() {
  if (!storageReady) {
    storageReady = getSqliteClient().batch([
      `CREATE TABLE IF NOT EXISTS products (
        id text PRIMARY KEY NOT NULL, brand text NOT NULL, name text NOT NULL,
        category text NOT NULL, volume text, price integer, price_type text NOT NULL,
        currency text DEFAULT 'JPY' NOT NULL, claims_json text DEFAULT '[]' NOT NULL,
        ingredient_highlights_json text DEFAULT '[]' NOT NULL, official_url text NOT NULL,
        source_publisher text NOT NULL, source_checked_at text NOT NULL,
        verification_status text NOT NULL, created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS consultations (
        id integer PRIMARY KEY AUTOINCREMENT NOT NULL, concern_summary text NOT NULL,
        selected_product_ids_json text DEFAULT '[]' NOT NULL,
        purchase_needed integer DEFAULT false NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS chat_sessions (
          owner_key text NOT NULL,
          id text NOT NULL,
          specialist_id text NOT NULL,
          title text NOT NULL,
          payload_json text NOT NULL,
          created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
          PRIMARY KEY(owner_key, id)
        )`,
      "CREATE INDEX IF NOT EXISTS chat_sessions_owner_specialist_updated_idx ON chat_sessions (owner_key, specialist_id, updated_at)",
      `CREATE TABLE IF NOT EXISTS deleted_chat_sessions (
          owner_key text NOT NULL,
          id text NOT NULL,
          deleted_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
          PRIMARY KEY(owner_key, id)
        )`,
      `CREATE TABLE IF NOT EXISTS beauty_check_ins (
        owner_key text NOT NULL, id text NOT NULL, specialist_id text NOT NULL,
        payload_json text NOT NULL, recorded_at text NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY(owner_key, id)
      )`,
      "CREATE INDEX IF NOT EXISTS beauty_check_ins_owner_specialist_recorded_idx ON beauty_check_ins (owner_key, specialist_id, recorded_at)",
      `CREATE TABLE IF NOT EXISTS uploaded_assets (
        owner_key text NOT NULL, id text NOT NULL, object_key text NOT NULL,
        file_name text NOT NULL, content_type text NOT NULL, byte_size integer NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
        PRIMARY KEY(owner_key, id)
      )`,
      "CREATE INDEX IF NOT EXISTS uploaded_assets_owner_created_idx ON uploaded_assets (owner_key, created_at)",
    ], "write").then(() => undefined).catch((error) => {
      storageReady = null;
      throw error;
    });
  }
  await storageReady;
}

export async function ensureChatSessionStorage() {
  await ensureAppStorage();
}
