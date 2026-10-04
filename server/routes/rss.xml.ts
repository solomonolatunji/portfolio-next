import { desc, eq } from "drizzle-orm";
import { getDb } from "#server/db";
import { categories, posts } from "#server/db/schema";

function escapeCdata(str: string): string {
  return `<![CDATA[${(str || "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const siteUrl = (config.public?.siteUrl as string) || "https://solomonolatunji.com";
  const db = getDb();

  const allPosts = await db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      description: posts.description,
      categoryId: posts.categoryId,
      categoryName: categories.name,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.published, true))
    .orderBy(desc(posts.createdAt));

  const items = allPosts
    .map((post) => {
      const postUrl = `${siteUrl}/blog/${post.slug}`;
      const pubDate = new Date(post.createdAt).toUTCString();
      const categoryTag = post.categoryName
        ? `\n      <category>${escapeCdata(post.categoryName)}</category>`
        : "";

      return `    <item>
      <title>${escapeCdata(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeCdata(post.description)}</description>
      <pubDate>${pubDate}</pubDate>${categoryTag}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeCdata((config.public?.siteName as string) || "Solomon Olatunji")}</title>
    <link>${siteUrl}</link>
    <description>${escapeCdata("Thoughts on engineering, distributed systems, startups, and philosophy.")}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  event.node.res.setHeader("Content-Type", "application/xml; charset=utf-8");
  return rss;
});
