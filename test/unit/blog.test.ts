import { describe, expect, it } from "vitest";
import { renderMarkdown } from "../../app/utils/markdown";
import { formatPageTitle, siteConfig } from "../../app/constants/site";
import { isAdminUsername, DEFAULT_ADMIN_USERNAME } from "../../server/utils/admin";

describe("renderMarkdown", () => {
  it("renders headers and bold text", () => {
    const md = "# Hello World\n\nThis is **bold** text.";
    const html = renderMarkdown(md);
    expect(html).toContain("<h1>Hello World</h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders lists and links with security attributes", () => {
    const md = "- [Link](https://example.com)\n- Item 2";
    const html = renderMarkdown(md);
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders code blocks", () => {
    const md = "```ts\nconst x: number = 42;\n```";
    const html = renderMarkdown(md);
    expect(html).toContain("<pre>");
    expect(html).toContain("const x: number = 42;");
  });

  it("handles empty or falsy markdown gracefully", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown(null as any)).toBe("");
    expect(renderMarkdown(undefined as any)).toBe("");
  });
});

describe("siteConfig and formatPageTitle", () => {
  it("formats page title with site name appended", () => {
    const title = formatPageTitle("My New Article");
    expect(title).toBe(`My New Article | ${siteConfig.name}`);
  });

  it("falls back to site title when no page title is provided", () => {
    expect(formatPageTitle()).toBe(`${siteConfig.name} | Portfolio`);
    expect(formatPageTitle("")).toBe(`${siteConfig.name} | Portfolio`);
  });

  it("has non-empty site configuration defaults", () => {
    expect(siteConfig.name).toBeTruthy();
    expect(siteConfig.shortName).toBeTruthy();
    expect(siteConfig.adminUsername).toBeTruthy();
  });
});

describe("isAdminUsername", () => {
  it("recognizes default admin username", () => {
    expect(isAdminUsername(DEFAULT_ADMIN_USERNAME)).toBe(true);
    expect(isAdminUsername("SOLOMONOLATUNJI")).toBe(true);
    expect(isAdminUsername("  solomonolatunji  ")).toBe(true);
  });

  it("rejects non-admin usernames and null/empty", () => {
    expect(isAdminUsername("random-user")).toBe(false);
    expect(isAdminUsername("hacker")).toBe(false);
    expect(isAdminUsername("")).toBe(false);
    expect(isAdminUsername(null)).toBe(false);
    expect(isAdminUsername(undefined)).toBe(false);
  });
});
