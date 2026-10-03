import { eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { postComments, postReactions, posts } from "#server/db/schema";
import { requireAdmin } from "#server/utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDb();

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid post ID." });
  }

  // Delete comments and reactions first
  await db.delete(postComments).where(eq(postComments.postId, id));
  await db.delete(postReactions).where(eq(postReactions.postId, id));

  const [result] = await db.delete(posts).where(eq(posts.id, id));
  return { ok: true };
});
