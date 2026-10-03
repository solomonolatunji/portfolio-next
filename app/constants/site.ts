import { env } from "../env";

export const siteConfig = {
  name: env.NUXT_PUBLIC_SITE_NAME || "Solomon Olatunji",
  shortName: env.NUXT_PUBLIC_SITE_SHORT_NAME || "SO",
  description: "Software engineer building useful products.",
  adminUsername: env.NUXT_PUBLIC_ADMIN_USERNAME || "solomonolatunji",
  url: env.NUXT_PUBLIC_SITE_URL || "https://solomonolatunji.com",
};

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return `${siteConfig.name} | Portfolio`;
  }
  return `${pageTitle} | ${siteConfig.name}`;
}
