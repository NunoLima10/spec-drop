import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const shares = pgTable("shares", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  readAt: timestamp("read_at", { withTimezone: true }),
  deleteAfterRead: boolean("delete_after_read").notNull().default(false),
  maxViews: integer("max_views"),
  currentViews: integer("current_views").notNull().default(0),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
