import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "#server/db";
import { commentReactions, postComments, postReactions, posts, users } from "#server/db/schema";
import { isAdminUser } from "#server/utils/admin";
import { getVisitorOrUser } from "#server/utils/visitor";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Slug is required." });
  }

  const [post] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1);
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found." });
  }

  const actor = await getVisitorOrUser(event);
  const isUserAdmin = actor.user ? isAdminUser(actor.user) : false;

  if (!post.published && !isUserAdmin) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found." });
  }

  if (post.published) {
    await db
      .update(posts)
      .set({ views: sql`${posts.views} + 1` })
      .where(eq(posts.id, post.id));
    post.views += 1;
  }

  // 1. Fetch Comments
  const rawComments = await db
    .select({
      id: postComments.id,
      postId: postComments.postId,
      userId: postComments.userId,
      guestName: postComments.guestName,
      guestEmail: postComments.guestEmail,
      parentId: postComments.parentId,
      content: postComments.content,
      createdAt: postComments.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
      profileUrl: users.profileUrl,
    })
    .from(postComments)
    .leftJoin(users, eq(users.id, postComments.userId))
    .where(eq(postComments.postId, post.id))
    .orderBy(asc(postComments.createdAt));

  const commentIds = rawComments.map((c) => c.id);
  const commentReactionsList =
    commentIds.length > 0
      ? await db
          .select({
            commentId: commentReactions.commentId,
            userId: commentReactions.userId,
          })
          .from(commentReactions)
          .where(inArray(commentReactions.commentId, commentIds))
      : [];

  const commentReactionsMap = new Map<number, { count: number; userReacted: boolean }>();
  for (const cr of commentReactionsList) {
    const cur = commentReactionsMap.get(cr.commentId) || { count: 0, userReacted: false };
    cur.count += 1;
    if (cr.userId === actor.id) {
      cur.userReacted = true;
    }
    commentReactionsMap.set(cr.commentId, cur);
  }

  type CommentNode = {
    id: number;
    postId: number;
    userId: string;
    parentId: number | null;
    content: string;
    createdAt: string;
    author: {
      id: string;
      username: string;
      avatarUrl: string | null;
      profileUrl: string;
      isGuest?: boolean;
    };
    reactionCount: number;
    userReacted: boolean;
    replies: CommentNode[];
  };

  const commentMap = new Map<number, CommentNode>();
  const rootComments: CommentNode[] = [];

  for (const c of rawComments) {
    const isGuest = !c.username;
    const authorName = c.username || c.guestName || "Guest";
    const authorAvatar =
      c.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authorName)}`;
    const crInfo = commentReactionsMap.get(c.id) || { count: 0, userReacted: false };

    const node: CommentNode = {
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      parentId: c.parentId,
      content: c.content,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      author: {
        id: c.userId,
        username: authorName,
        avatarUrl: authorAvatar,
        profileUrl: c.profileUrl || "",
        isGuest,
      },
      reactionCount: crInfo.count,
      userReacted: crInfo.userReacted,
      replies: [],
    };
    commentMap.set(c.id, node);
  }

  for (const c of rawComments) {
    const node = commentMap.get(c.id);
    if (!node) continue;
    if (c.parentId && commentMap.has(c.parentId)) {
      commentMap.get(c.parentId)!.replies.push(node);
    } else {
      rootComments.push(node);
    }
  }

  // 2. Fetch Post Reactions
  const reactions = await db
    .select({
      reactionType: postReactions.reactionType,
      userId: postReactions.userId,
    })
    .from(postReactions)
    .where(eq(postReactions.postId, post.id));

  const counts: Record<string, number> = {
    heart: 0,
    fire: 0,
    rocket: 0,
    like: 0,
    bulb: 0,
  };
  const userReactions: string[] = [];

  for (const r of reactions) {
    const cur = counts[r.reactionType];
    if (typeof cur === "number") {
      counts[r.reactionType] = cur + 1;
    }
    if (r.userId === actor.id) {
      userReactions.push(r.reactionType);
    }
  }

  return {
    post: {
      ...post,
      published: Boolean(post.published),
      allowComments: Boolean(post.allowComments),
      createdAt:
        post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
      updatedAt:
        post.updatedAt instanceof Date ? post.updatedAt.toISOString() : String(post.updatedAt),
    },
    comments: rootComments,
    reactions: {
      counts,
      userReactions,
      total: reactions.length,
    },
  };
});
