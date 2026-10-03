export const siteConfig = {
  name: "Solomon Olatunji",
  shortName: "SO",
  description: "Solomon Olatunji — software engineer building useful products.",
  adminUsername: "solomonolatunji",
  url: "https://solomonolatunji.com",
};

export function formatPageTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return `${siteConfig.name} | Portfolio`;
  }
  return `${pageTitle} | ${siteConfig.name}`;
}
