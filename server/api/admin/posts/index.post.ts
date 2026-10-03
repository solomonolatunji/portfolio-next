import { readBody } from "h3";
import { eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { posts } from "#server/db/schema";
import { requireAdmin } from "#server/utils/admin";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function calculateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  const db = getDb();

  const body = await readBody<{
    title?: string;
    slug?: string;
    description?: string;
    content?: string;
    featuredImageUrl?: string;
    published?: boolean;
    featured?: boolean;
    allowComments?: boolean;
  }>(event);

  const title = body?.title?.trim();
  if (!title) {
    throw createError({ statusCode: 400, statusMessage: "Title is required." });
  }

  const rawSlug = body?.slug?.trim() || slugify(title);
  const slug = slugify(rawSlug);
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: "Valid slug is required." });
  }

  // Check unique slug
  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: "A post with this slug already exists." });
  }

  const description = body?.description?.trim() || "";
  const content = body?.content || "";
  const featuredImageUrl = body?.featuredImageUrl?.trim() || null;
  const categoryId = body?.categoryId?.trim() || null;
  const published = Boolean(body?.published);
  const featured = Boolean(body?.featured);
  const allowComments = body?.allowComments !== undefined ? Boolean(body.allowComments) : true;
  const readTimeMinutes = calculateReadTime(content);

  const [result] = await db.insert(posts).values({
    title,
    slug,
    description,
    content,
    featuredImageUrl,
    categoryId,
    published,
    featured,
    allowComments,
    readTimeMinutes,
    views: 0,
  });

  return { id: result.insertId, slug, ok: true };
});
