import { and, eq } from "drizzle-orm";
import { getRouterParam, readBody } from "h3";
import { getDb } from "#server/db";
import { postComments, posts } from "#server/db/schema";
import { getVisitorOrUser } from "#server/utils/visitor";

export default defineEventHandler(async (event) => {
  const actor = await getVisitorOrUser(event);

  const idParam = getRouterParam(event, "id");
  const postId = Number(idParam);
  if (!postId || Number.isNaN(postId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid post ID." });
  }

  const db = getDb();
  const [post] = await db
    .select({ id: posts.id, allowComments: posts.allowComments })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }
  if (!post.allowComments) {
    throw createError({ statusCode: 403, statusMessage: "Comments are disabled for this article." });
  }

  const body = await readBody<{
    content?: string;
    parentId?: number | null;
    guestName?: string;
    guestEmail?: string;
  }>(event);

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

  let authorName = actor.user?.username || "";
  let authorAvatar = actor.user?.avatarUrl || null;
  let authorProfile = actor.user?.profileUrl || "";
  let isGuest = actor.isGuest;
  let guestName: string | null = null;
  let guestEmail: string | null = null;

  if (actor.isGuest) {
    const rawName = body?.guestName?.trim();
    if (!rawName) {
      throw createError({ statusCode: 400, statusMessage: "Please provide your name or sign in with GitHub." });
    }
    guestName = rawName.slice(0, 128);
    authorName = guestName;
    guestEmail = body?.guestEmail?.trim()?.slice(0, 255) || null;
    authorAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
    authorProfile = "";
  }

  let parentId: number | null = null;
  if (body?.parentId && typeof body.parentId === "number") {
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
    userId: actor.id,
    guestName,
    guestEmail,
    parentId,
    content,
  });

  return {
    id: result.insertId,
    postId,
    userId: actor.id,
    parentId,
    content,
    createdAt: new Date().toISOString(),
    author: {
      id: actor.id,
      username: authorName,
      avatarUrl: authorAvatar,
      profileUrl: authorProfile,
      isGuest,
    },
    reactionCount: 0,
    userReacted: false,
    replies: [],
    ok: true,
  };
});
