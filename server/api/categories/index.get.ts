import { count, desc, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { categories, posts } from "#server/db/schema";

export default defineEventHandler(async () => {
  const db = getDb();

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
      const [postCountResult] = await db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.categoryId, cat.id));

      return {
        ...cat,
        postCount: Number(postCountResult?.count || 0),
      };
    })
  );

  return categoriesWithCounts;
});
