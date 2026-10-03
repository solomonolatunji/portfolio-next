import {
  boolean,
  int,
  index,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

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

export const categories = mysqlTable(
  "categories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    slug: varchar("slug", { length: 64 }).notNull(),
    name: varchar("name", { length: 128 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("idx_categories_slug").on(table.slug)]
);

export const posts = mysqlTable(
  "posts",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: varchar("description", { length: 500 }).notNull(),
    content: text("content").notNull(),
    featuredImageUrl: varchar("featured_image_url", { length: 2048 }),
    categoryId: varchar("category_id", { length: 64 }).references(() => categories.id),
    published: boolean("published").notNull().default(false),
    featured: boolean("featured").notNull().default(false),
    allowComments: boolean("allow_comments").notNull().default(true),
    readTimeMinutes: int("read_time_minutes").notNull().default(3),
    views: int("views").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("idx_posts_slug").on(table.slug),
    index("idx_posts_category_id").on(table.categoryId),
    index("idx_posts_published").on(table.published),
    index("idx_posts_featured").on(table.featured),
    index("idx_posts_created_at").on(table.createdAt),
  ]
);

export const postComments = mysqlTable(
  "post_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("post_id").notNull(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    guestName: varchar("guest_name", { length: 128 }),
    guestEmail: varchar("guest_email", { length: 255 }),
    parentId: int("parent_id"),
    content: varchar("content", { length: 1000 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_post_comments_post_id").on(table.postId),
    index("idx_post_comments_parent_id").on(table.parentId),
    index("idx_post_comments_created_at").on(table.createdAt),
  ]
);

export const postReactions = mysqlTable(
  "post_reactions",
  {
    id: int("id").autoincrement().primaryKey(),
    postId: int("post_id").notNull(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    reactionType: varchar("reaction_type", { length: 32 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_post_reactions_unique").on(table.postId, table.userId, table.reactionType),
    index("idx_post_reactions_post_id").on(table.postId),
  ]
);

export const commentReactions = mysqlTable(
  "comment_reactions",
  {
    id: int("id").autoincrement().primaryKey(),
    commentId: int("comment_id").notNull(),
    userId: varchar("user_id", { length: 64 }).notNull(),
    reactionType: varchar("reaction_type", { length: 32 }).notNull().default("heart"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("idx_comment_reactions_unique").on(
      table.commentId,
      table.userId,
      table.reactionType
    ),
    index("idx_comment_reactions_comment_id").on(table.commentId),
  ]
);
