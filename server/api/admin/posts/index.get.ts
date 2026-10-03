import { count, desc, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { categories, postComments, postReactions, posts } from "#server/db/schema";
import { requireAdmin } from "#server/utils/admin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event as unknown as Parameters<typeof requireAdmin>[0]);
  const db = getDb();

  const allPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      featuredImageUrl: posts.featuredImageUrl,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      categorySlug: categories.slug,
      published: posts.published,
      featured: posts.featured,
      allowComments: posts.allowComments,
      readTimeMinutes: posts.readTimeMinutes,
      views: posts.views,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .orderBy(desc(posts.createdAt));

  // Compute comment and reaction counts
  const postSummaries = await Promise.all(
    allPosts.map(async (p) => {
      const [commentCountResult] = await db
        .select({ count: count() })
        .from(postComments)
        .where(eq(postComments.postId, p.id));

      const [reactionCountResult] = await db
        .select({ count: count() })
        .from(postReactions)
        .where(eq(postReactions.postId, p.id));

      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        featuredImageUrl: p.featuredImageUrl,
        categoryId: p.categoryId,
        category: p.categoryId
          ? {
              id: p.categoryId,
              name: p.categoryName || p.categoryId,
              slug: p.categorySlug || p.categoryId,
            }
          : null,
        published: Boolean(p.published),
        featured: Boolean(p.featured),
        allowComments: Boolean(p.allowComments),
        readTimeMinutes: p.readTimeMinutes,
        views: p.views,
        commentCount: Number(commentCountResult?.count || 0),
        reactionCount: Number(reactionCountResult?.count || 0),
        createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : String(p.updatedAt),
      };
    })
  );

  return { posts: postSummaries };
});
