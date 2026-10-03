import { marked } from "marked";

marked.use({
  renderer: {
    link({ href, title, text }: { href: string; title?: string | null; text: string }) {
      const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
      const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : "";
      const titleAttr = title ? ` title="${title}"` : "";
      return `<a href="${href}"${titleAttr}${target}>${text}</a>`;
    },
  },
});

export function renderMarkdown(content: string): string {
  if (!content) return "";
  try {
    return marked.parse(content, {
      async: false,
      breaks: true,
      gfm: true,
    }) as string;
  } catch (err) {
    console.error("Markdown parse error:", err);
    return `<p>${content}</p>`;
  }
}
