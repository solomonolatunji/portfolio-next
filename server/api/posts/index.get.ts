import { and, count, desc, eq, like, or } from "drizzle-orm";
import { getQuery } from "h3";
import { getDb } from "#server/db";
import { categories, postComments, postReactions, posts } from "#server/db/schema";

export default defineEventHandler(async (event) => {
  const db = getDb();
  const query = getQuery(event);

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.max(1, Math.min(50, Number(query.limit) || 6));
  const search = typeof query.search === "string" ? query.search.trim() : "";
  const categoryFilter = typeof query.category === "string" ? query.category.trim() : "";

  // 1. Fetch Categories with published post counts
  const allCategories = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .orderBy(categories.name);

  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (cat) => {
      const [countResult] = await db
        .select({ count: count() })
        .from(posts)
        .where(and(eq(posts.categoryId, cat.id), eq(posts.published, true)));

      return {
        ...cat,
        postCount: Number(countResult?.count || 0),
      };
    })
  );

  // 2. Fetch Top 3 Featured Posts
  const rawFeatured = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      featuredImageUrl: posts.featuredImageUrl,
      categoryId: posts.categoryId,
      categorySlug: categories.slug,
      categoryName: categories.name,
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
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        featuredImageUrl: p.featuredImageUrl,
        categoryId: p.categoryId,
        category: p.categoryId
          ? {
              id: p.categoryId,
              slug: p.categorySlug || p.categoryId,
              name: p.categoryName || p.categoryId,
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

  // 3. Build filter condition
  const conditions = [eq(posts.published, true)];

  if (categoryFilter) {
    conditions.push(or(eq(categories.slug, categoryFilter), eq(posts.categoryId, categoryFilter))!);
  }

  if (search) {
    conditions.push(
      or(
        like(posts.title, `%${search}%`),
        like(posts.description, `%${search}%`),
        like(posts.content, `%${search}%`)
      )!
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
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
      categoryId: posts.categoryId,
      categorySlug: categories.slug,
      categoryName: categories.name,
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
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        featuredImageUrl: p.featuredImageUrl,
        categoryId: p.categoryId,
        category: p.categoryId
          ? {
              id: p.categoryId,
              slug: p.categorySlug || p.categoryId,
              name: p.categoryName || p.categoryId,
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

  return {
    featured: featuredSummaries,
    posts: postSummaries,
    categories: categoriesWithCounts,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
});
