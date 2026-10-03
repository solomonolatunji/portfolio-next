import { readBody } from "h3";
import { and, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { postComments, posts, users } from "#server/db/schema";
import { getGuestbookSession } from "#server/utils/guestbook";

export default defineEventHandler(async (event) => {
  const user = await getGuestbookSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in with GitHub to leave a comment or reply.",
    });
  }

  const idParam = getRouterParam(event, "id");
  const postId = Number(idParam);
  if (!postId || Number.isNaN(postId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid post ID." });
  }

  const db = getDb();
  const [post] = await db.select({ id: posts.id }).from(posts).where(eq(posts.id, postId)).limit(1);
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }

  const body = await readBody<{ content?: string; parentId?: number | null }>(event);
  const content = body?.content?.trim() || "";

  if (!content) {
    throw createError({ statusCode: 400, statusMessage: "Comment content cannot be empty." });
  }
  if (content.length > 1000) {
    throw createError({
      statusCode: 400,
      statusMessage: "Comments must be 1000 characters or fewer.",
    });
  }

  let parentId: number | null = null;
  if (body?.parentId && typeof body.parentId === "number") {
    // Verify parent comment exists on same post
    const [parent] = await db
      .select({ id: postComments.id })
      .from(postComments)
      .where(and(eq(postComments.id, body.parentId), eq(postComments.postId, postId)))
      .limit(1);

    if (parent) {
      parentId = parent.id;
    }
  }

  const [result] = await db.insert(postComments).values({
    postId,
    userId: user.id,
    parentId,
    content,
  });

  return {
    id: result.insertId,
    postId,
    userId: user.id,
    parentId,
    content,
    createdAt: new Date().toISOString(),
    author: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      profileUrl: user.profileUrl,
    },
    replies: [],
    ok: true,
  };
});
