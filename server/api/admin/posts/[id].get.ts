import { eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { posts } from "#server/db/schema";
import { requireAdmin } from "#server/utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDb();

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid post ID." });
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }

  return {
    post: {
      ...post,
      published: Boolean(post.published),
      createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
      updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : String(post.updatedAt),
    },
  };
});
