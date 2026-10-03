export function formatPageTitle(siteName: string, pageTitle?: string): string {
  if (!pageTitle) {
    return `${siteName} | Portfolio`;
  }
  return `${pageTitle} | ${siteName}`;
}
