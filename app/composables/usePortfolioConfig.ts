import { formatPageTitle } from "~/utils/site";

export function usePortfolioConfig() {
  const { public: publicConfig } = useRuntimeConfig();

  return {
    name: publicConfig.siteName,
    shortName: publicConfig.siteShortName,
    url: publicConfig.siteUrl,
    adminUsername: publicConfig.adminUsername,
    description: "Software engineer building useful products.",
    pageTitle: (title?: string) => formatPageTitle(publicConfig.siteName, title),
  };
}
