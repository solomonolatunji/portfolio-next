import { int, index, mysqlTable, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  avatarUrl: varchar("avatar_url", { length: 2048 }),
  profileUrl: varchar("profile_url", { length: 2048 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const sessions = mysqlTable(
  "sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [index("idx_sessions_expires_at").on(table.expiresAt)]
);

export const guestbookEntries = mysqlTable(
  "guestbook_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    message: varchar("message", { length: 500 }).notNull(),
    signatureUrl: varchar("signature_url", { length: 2048 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("idx_guestbook_entries_created_at").on(table.createdAt)]
);
