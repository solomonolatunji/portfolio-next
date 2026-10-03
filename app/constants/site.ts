export const siteConfig = {
  name: (typeof process !== "undefined" && process.env?.NUXT_PUBLIC_SITE_NAME) || "Solomon Olatunji",
  shortName: (typeof process !== "undefined" && process.env?.NUXT_PUBLIC_SITE_SHORT_NAME) || "SO",
  description: "Software engineer building useful products.",
  adminUsername: (typeof process !== "undefined" && (process.env?.ADMIN_GITHUB_USERNAME || process.env?.NUXT_PUBLIC_ADMIN_USERNAME)) || "solomonolatunji",
  url: (typeof process !== "undefined" && process.env?.NUXT_PUBLIC_SITE_URL) || "https://solomonolatunji.com",
};

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return `${siteConfig.name} | Portfolio`;
  }
  return `${pageTitle} | ${siteConfig.name}`;
}
