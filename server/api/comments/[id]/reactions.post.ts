import { and, eq } from "drizzle-orm";
import { getRouterParam, readBody } from "h3";
import { getDb } from "#server/db";
import { commentReactions, postComments } from "#server/db/schema";
import { getVisitorOrUser } from "#server/utils/visitor";

export default defineEventHandler(async (event) => {
  const actor = await getVisitorOrUser(event);

  const idParam = getRouterParam(event, "id");
  const commentId = Number(idParam);
  if (!commentId || Number.isNaN(commentId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid comment ID." });
  }

  const db = getDb();
  const [comment] = await db
    .select({ id: postComments.id })
    .from(postComments)
    .where(eq(postComments.id, commentId))
    .limit(1);

  if (!comment) {
    throw createError({ statusCode: 404, statusMessage: "Comment not found." });
  }

  const body = await readBody<{ reactionType?: string }>(event).catch(() => ({}));
  const reactionType =
    (body &&
    typeof body === "object" &&
    "reactionType" in body &&
    typeof body.reactionType === "string"
      ? body.reactionType.trim()
      : "") || "heart";

  const [existing] = await db
    .select({ id: commentReactions.id })
    .from(commentReactions)
    .where(
      and(
        eq(commentReactions.commentId, commentId),
        eq(commentReactions.userId, actor.id),
        eq(commentReactions.reactionType, reactionType)
      )
    )
    .limit(1);

  let userReacted = false;
  if (existing) {
    await db.delete(commentReactions).where(eq(commentReactions.id, existing.id));
    userReacted = false;
  } else {
    await db.insert(commentReactions).values({
      commentId,
      userId: actor.id,
      reactionType,
    });
    userReacted = true;
  }

  const allReactions = await db
    .select({ id: commentReactions.id })
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId));

  return {
    reacted: userReacted,
    reactionCount: allReactions.length,
  };
});
