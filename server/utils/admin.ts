import type { H3Event } from "h3";
import { env } from "~~/env";

export const DEFAULT_ADMIN_USERNAME = "solomonolatunji";

export function getAdminUsernames(): string[] {
  const envVal = env.ADMIN_GITHUB_USERNAME;
  if (!envVal) return [DEFAULT_ADMIN_USERNAME.toLowerCase()];
  return envVal
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function extractGithubHandle(profileUrl: string | null | undefined): string | null {
  if (!profileUrl) return null;
  const match = profileUrl.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
  return match?.[1] ? match[1].toLowerCase() : null;
}

export function isAdminUser(
  user: { username?: string | null; profileUrl?: string | null } | null | undefined
): boolean {
  if (!user) return false;
  const list = getAdminUsernames();
  if (user.username && list.includes(user.username.trim().toLowerCase())) return true;
  if (user.username && list.includes(user.username.replace(/\s+/g, "").toLowerCase())) return true;
  const handle = extractGithubHandle(user.profileUrl);
  if (handle && list.includes(handle)) return true;
  return false;
}

export function isAdminUsername(username: string | null | undefined): boolean {
  if (!username) return false;
  const list = getAdminUsernames();
  if (list.includes(username.trim().toLowerCase())) return true;
  if (list.includes(username.replace(/\s+/g, "").toLowerCase())) return true;
  return false;
}

export async function requireAdmin(event: H3Event) {
  const { getGuestbookSession } = await import("./guestbook");
  const user = await getGuestbookSession(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Please sign in with GitHub to access admin controls.",
    });
  }

  // Check login handle and profile against admin list
  if (!isAdminUser(user)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: You are not authorized as an administrator.",
    });
  }

  return user;
}
