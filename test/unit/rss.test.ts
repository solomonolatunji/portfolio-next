import { describe, expect, it } from "vitest";

describe("RSS 2.0 Feed Formatting", () => {
  function escapeCdata(str: string): string {
    return `<![CDATA[${(str || "").replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
  }

  function formatRssItem(item: {
    title: string;
    description: string;
    slug: string;
    createdAt: string;
    categoryName?: string;
    siteUrl: string;
  }): string {
    const postUrl = `${item.siteUrl}/blog/${item.slug}`;
    const pubDate = new Date(item.createdAt).toUTCString();
    const categoryTag = item.categoryName
      ? `\n      <category>${escapeCdata(item.categoryName)}</category>`
      : "";

    return `    <item>
      <title>${escapeCdata(item.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description>${escapeCdata(item.description)}</description>
      <pubDate>${pubDate}</pubDate>${categoryTag}
    </item>`;
  }

  it("safely escapes CDATA with nested end tags", () => {
    const dangerous = "This text has a ]]> tag inside";
    const result = escapeCdata(dangerous);
    expect(result).toBe("<![CDATA[This text has a ]]]]><![CDATA[> tag inside]]>");
  });

  it("formats valid RSS items with category and permaLink", () => {
    const xml = formatRssItem({
      title: "Why Boring Architecture Wins",
      description: "Simple architectures are easier to maintain.",
      slug: "boring-architecture-wins",
      createdAt: "2026-10-02T12:00:00.000Z",
      categoryName: "Engineering",
      siteUrl: "https://solomonolatunji.com",
    });

    expect(xml).toContain("<title><![CDATA[Why Boring Architecture Wins]]></title>");
    expect(xml).toContain("<link>https://solomonolatunji.com/blog/boring-architecture-wins</link>");
    expect(xml).toContain(
      '<guid isPermaLink="true">https://solomonolatunji.com/blog/boring-architecture-wins</guid>'
    );
    expect(xml).toContain("<pubDate>Fri, 02 Oct 2026 12:00:00 GMT</pubDate>");
    expect(xml).toContain("<category><![CDATA[Engineering]]></category>");
  });

  it("handles missing category gracefully", () => {
    const xml = formatRssItem({
      title: "Untagged Post",
      description: "Description",
      slug: "untagged",
      createdAt: "2026-10-01T00:00:00.000Z",
      siteUrl: "https://solomonolatunji.com",
    });

    expect(xml).not.toContain("<category>");
    expect(xml).toContain("<title><![CDATA[Untagged Post]]></title>");
  });
});
