import { sql } from "drizzle-orm";
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  volume: text("volume"),
  price: integer("price"),
  priceType: text("price_type").notNull(),
  currency: text("currency").notNull().default("JPY"),
  claimsJson: text("claims_json").notNull().default("[]"),
  ingredientHighlightsJson: text("ingredient_highlights_json").notNull().default("[]"),
  officialUrl: text("official_url").notNull(),
  sourcePublisher: text("source_publisher").notNull(),
  sourceCheckedAt: text("source_checked_at").notNull(),
  verificationStatus: text("verification_status").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const consultations = sqliteTable("consultations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  concernSummary: text("concern_summary").notNull(),
  selectedProductIdsJson: text("selected_product_ids_json").notNull().default("[]"),
  purchaseNeeded: integer("purchase_needed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatSessions = sqliteTable("chat_sessions", {
  ownerKey: text("owner_key").notNull(),
  id: text("id").notNull(),
  specialistId: text("specialist_id").notNull(),
  title: text("title").notNull(),
  payloadJson: text("payload_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.ownerKey, table.id] }),
  index("chat_sessions_owner_specialist_updated_idx").on(table.ownerKey, table.specialistId, table.updatedAt),
]);

export const deletedChatSessions = sqliteTable("deleted_chat_sessions", {
  ownerKey: text("owner_key").notNull(),
  id: text("id").notNull(),
  deletedAt: text("deleted_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.ownerKey, table.id] }),
]);

export const beautyCheckIns = sqliteTable("beauty_check_ins", {
  ownerKey: text("owner_key").notNull(),
  id: text("id").notNull(),
  specialistId: text("specialist_id").notNull(),
  payloadJson: text("payload_json").notNull(),
  recordedAt: text("recorded_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.ownerKey, table.id] }),
  index("beauty_check_ins_owner_specialist_recorded_idx").on(table.ownerKey, table.specialistId, table.recordedAt),
]);

export const uploadedAssets = sqliteTable("uploaded_assets", {
  ownerKey: text("owner_key").notNull(),
  id: text("id").notNull(),
  objectKey: text("object_key").notNull(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.ownerKey, table.id] }),
  index("uploaded_assets_owner_created_idx").on(table.ownerKey, table.createdAt),
]);

export const ingredients = sqliteTable("ingredients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("ingredients_normalized_name_uidx").on(table.normalizedName),
]);

export const concerns = sqliteTable("concerns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const productIngredients = sqliteTable("product_ingredients", {
  productId: text("product_id").notNull(),
  ingredientId: text("ingredient_id").notNull(),
  sourceUrl: text("source_url").notNull(),
  verifiedAt: text("verified_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.productId, table.ingredientId] }),
  index("product_ingredients_ingredient_idx").on(table.ingredientId),
]);

export const ingredientConcerns = sqliteTable("ingredient_concerns", {
  ingredientId: text("ingredient_id").notNull(),
  concernId: text("concern_id").notNull(),
  relation: text("relation").notNull(),
  evidenceLevel: text("evidence_level").notNull(),
  sourceUrl: text("source_url").notNull(),
  verifiedAt: text("verified_at").notNull(),
}, (table) => [
  primaryKey({ columns: [table.ingredientId, table.concernId, table.relation] }),
  index("ingredient_concerns_concern_idx").on(table.concernId, table.evidenceLevel),
]);

export const userProfiles = sqliteTable("user_profiles", {
  ownerKey: text("owner_key").primaryKey(),
  profileJson: text("profile_json").notNull().default("{}"),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const userItems = sqliteTable("user_items", {
  ownerKey: text("owner_key").notNull(),
  productId: text("product_id").notNull(),
  status: text("status").notNull().default("using"),
  usageFrequency: text("usage_frequency"),
  userRating: integer("user_rating"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  primaryKey({ columns: [table.ownerKey, table.productId] }),
  index("user_items_owner_status_idx").on(table.ownerKey, table.status),
]);

export const recommendationRuns = sqliteTable("recommendation_runs", {
  id: text("id").primaryKey(),
  ownerKey: text("owner_key").notNull(),
  consultationId: integer("consultation_id"),
  contextJson: text("context_json").notNull(),
  decision: text("decision").notNull(),
  selectedProductId: text("selected_product_id"),
  scoresJson: text("scores_json").notNull().default("[]"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("recommendation_runs_owner_created_idx").on(table.ownerKey, table.createdAt),
]);

export const recommendationEvidence = sqliteTable("recommendation_evidence", {
  recommendationId: text("recommendation_id").primaryKey(),
  evidenceJson: text("evidence_json").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
