import { readBody } from "h3";
import { and, eq, ne } from "drizzle-orm";
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
  await requireAdmin(event as unknown as Parameters<typeof requireAdmin>[0]);
  const db = getDb();

  const idParam = getRouterParam(event, "id");
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid post ID." });
  }

  const [existing] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Post not found." });
  }

  const body = (await readBody(event as unknown as Parameters<typeof readBody>[0])) as
    | {
        title?: string;
        slug?: string;
        description?: string;
        content?: string;
        featuredImageUrl?: string;
        categoryId?: string;
        published?: boolean;
        featured?: boolean;
        allowComments?: boolean;
      }
    | undefined;

  const title = body?.title?.trim() || existing.title;
  const rawSlug = body?.slug?.trim() || slugify(title);
  const slug = slugify(rawSlug);

  // Check unique slug on other posts
  const [duplicate] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(and(eq(posts.slug, slug), ne(posts.id, id)))
    .limit(1);

  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: "Another post already uses this slug." });
  }

  const description =
    body?.description !== undefined ? body.description.trim() : existing.description;
  const content = body?.content !== undefined ? body.content : existing.content;
  const featuredImageUrl =
    body?.featuredImageUrl !== undefined
      ? body.featuredImageUrl.trim() || null
      : existing.featuredImageUrl;
  const categoryId =
    body?.categoryId !== undefined ? body.categoryId?.trim() || null : existing.categoryId;
  const published = body?.published !== undefined ? Boolean(body.published) : existing.published;
  const featured =
    body?.featured !== undefined ? Boolean(body.featured) : Boolean(existing.featured);
  const allowComments =
    body?.allowComments !== undefined
      ? Boolean(body.allowComments)
      : Boolean(existing.allowComments);
  const readTimeMinutes = calculateReadTime(content);

  await db
    .update(posts)
    .set({
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
    })
    .where(eq(posts.id, id));

  return { ok: true, slug };
});
