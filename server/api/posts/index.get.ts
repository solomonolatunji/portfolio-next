import { count, desc, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { postComments, postReactions, posts } from "#server/db/schema";

export default defineEventHandler(async () => {
  const db = getDb();

  const publishedPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      featuredImageUrl: posts.featuredImageUrl,
      published: posts.published,
      allowComments: posts.allowComments,
      readTimeMinutes: posts.readTimeMinutes,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  const postSummaries = await Promise.all(
    publishedPosts.map(async (p) => {
      const [commentCountResult] = await db
        .select({ count: count() })
        .from(postComments)
        .where(eq(postComments.postId, p.id));

      const [reactionCountResult] = await db
        .select({ count: count() })
        .from(postReactions)
        .where(eq(postReactions.postId, p.id));

      return {
        ...p,
        published: Boolean(p.published),
        allowComments: Boolean(p.allowComments),
        commentCount: Number(commentCountResult?.count || 0),
        reactionCount: Number(reactionCountResult?.count || 0),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
      };
    })
  );

  return { posts: postSummaries };
});
