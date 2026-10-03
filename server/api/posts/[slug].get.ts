import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "#server/db";
import { postComments, postReactions, posts, users } from "#server/db/schema";
import { isAdminUsername } from "#server/utils/admin";
import { getGuestbookSession } from "#server/utils/guestbook";

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

  const currentUser = await getGuestbookSession(event);
  const isUserAdmin = currentUser ? isAdminUsername(currentUser.username) : false;

  // If draft and not admin, return 404
  if (!post.published && !isUserAdmin) {
    throw createError({ statusCode: 404, statusMessage: "Blog post not found." });
  }

  // Atomically increment views (only if published, and avoid inflating on admin preview)
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
      parentId: postComments.parentId,
      content: postComments.content,
      createdAt: postComments.createdAt,
      username: users.username,
      avatarUrl: users.avatarUrl,
      profileUrl: users.profileUrl,
    })
    .from(postComments)
    .innerJoin(users, eq(users.id, postComments.userId))
    .where(eq(postComments.postId, post.id))
    .orderBy(asc(postComments.createdAt));

  // Build comment tree
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
    };
    replies: CommentNode[];
  };

  const commentMap = new Map<number, CommentNode>();
  const rootComments: CommentNode[] = [];

  for (const c of rawComments) {
    const node: CommentNode = {
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      parentId: c.parentId,
      content: c.content,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
      author: {
        id: c.userId,
        username: c.username,
        avatarUrl: c.avatarUrl,
        profileUrl: c.profileUrl,
      },
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

  // 2. Fetch Reactions
  const reactions = await db
    .select({
      reactionType: postReactions.reactionType,
      userId: postReactions.userId,
    })
    .from(postReactions)
    .where(eq(postReactions.postId, post.id));

  const validTypes = ["heart", "fire", "rocket", "like", "bulb"] as const;
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
    if (currentUser && r.userId === currentUser.id) {
      userReactions.push(r.reactionType);
    }
  }

  return {
    post: {
      ...post,
      published: Boolean(post.published),
      createdAt: post.createdAt instanceof Date ? post.createdAt.toISOString() : String(post.createdAt),
      updatedAt: post.updatedAt instanceof Date ? post.updatedAt.toISOString() : String(post.updatedAt),
    },
    comments: rootComments,
    reactions: {
      counts,
      userReactions,
      total: reactions.length,
    },
  };
});
