import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const shares = sqliteTable("shares", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  expiresAt: text("expires_at"),
  readAt: text("read_at"),
  deleteAfterRead: integer("delete_after_read", { mode: "boolean" })
    .notNull()
    .default(false),
  maxViews: integer("max_views"),
  currentViews: integer("current_views").notNull().default(0),
  deletedAt: text("deleted_at"),
});
