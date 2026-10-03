import { and, count, desc, eq, like, or } from "drizzle-orm";
import { getQuery } from "h3";
import { getDb } from "#server/db";
import { postComments, postReactions, posts } from "#server/db/schema";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 6));
  const search = typeof query.search === "string" ? query.search.trim() : "";

  // 1. Fetch Top 3 Featured Posts
  const rawFeatured = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      featuredImageUrl: posts.featuredImageUrl,
      published: posts.published,
      featured: posts.featured,
      allowComments: posts.allowComments,
      readTimeMinutes: posts.readTimeMinutes,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.featured, true)))
    .orderBy(desc(posts.createdAt))
    .limit(3);

  const featuredSummaries = await Promise.all(
    rawFeatured.map(async (p) => {
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
        featured: Boolean(p.featured),
        allowComments: Boolean(p.allowComments),
        commentCount: Number(commentCountResult?.count || 0),
        reactionCount: Number(reactionCountResult?.count || 0),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
      };
    })
  );

  // 2. Fetch paginated posts with optional search filter
  const searchCondition = search
    ? or(
        like(posts.title, `%${search}%`),
        like(posts.description, `%${search}%`),
        like(posts.content, `%${search}%`)
      )
    : undefined;

  const whereClause = searchCondition
    ? and(eq(posts.published, true), searchCondition)
    : eq(posts.published, true);

  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .where(whereClause);

  const total = Number(totalResult?.count || 0);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const offset = (page - 1) * limit;

  const paginatedPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      featuredImageUrl: posts.featuredImageUrl,
      published: posts.published,
      featured: posts.featured,
      allowComments: posts.allowComments,
      readTimeMinutes: posts.readTimeMinutes,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(whereClause)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const postSummaries = await Promise.all(
    paginatedPosts.map(async (p) => {
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
        featured: Boolean(p.featured),
        allowComments: Boolean(p.allowComments),
        commentCount: Number(commentCountResult?.count || 0),
        reactionCount: Number(reactionCountResult?.count || 0),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
      };
    })
  );

  return {
    featured: featuredSummaries,
    posts: postSummaries,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
});
