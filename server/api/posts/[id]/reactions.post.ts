import { readBody } from "h3";
import { and, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { postReactions, posts } from "#server/db/schema";
import { getGuestbookSession } from "#server/utils/guestbook";

const VALID_REACTION_TYPES = new Set(["heart", "fire", "rocket", "like", "bulb"]);

export default defineEventHandler(async (event) => {
  const user = await getGuestbookSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in with GitHub to react to posts.",
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

  const body = await readBody<{ reactionType?: string }>(event);
  const reactionType = body?.reactionType?.trim() || "";

  if (!VALID_REACTION_TYPES.has(reactionType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid reaction type. Must be one of: ${[...VALID_REACTION_TYPES].join(", ")}`,
    });
  }

  // Check if reaction already exists
  const [existing] = await db
    .select({ id: postReactions.id })
    .from(postReactions)
    .where(
      and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, user.id),
        eq(postReactions.reactionType, reactionType)
      )
    )
    .limit(1);

  let userReacted = false;
  if (existing) {
    // Toggle off (remove)
    await db.delete(postReactions).where(eq(postReactions.id, existing.id));
    userReacted = false;
  } else {
    // Toggle on (add)
    await db.insert(postReactions).values({
      postId,
      userId: user.id,
      reactionType,
    });
    userReacted = true;
  }

  // Recalculate summary
  const allReactions = await db
    .select({
      reactionType: postReactions.reactionType,
      userId: postReactions.userId,
    })
    .from(postReactions)
    .where(eq(postReactions.postId, postId));

  const counts: Record<string, number> = {
    heart: 0,
    fire: 0,
    rocket: 0,
    like: 0,
    bulb: 0,
  };
  const userReactions: string[] = [];

  for (const r of allReactions) {
    const cur = counts[r.reactionType];
    if (typeof cur === "number") {
      counts[r.reactionType] = cur + 1;
    }
    if (r.userId === user.id) {
      userReactions.push(r.reactionType);
    }
  }

  return {
    reacted: userReacted,
    reactions: {
      counts,
      userReactions,
      total: allReactions.length,
    },
    ok: true,
  };
});
