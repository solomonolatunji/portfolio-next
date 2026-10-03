import type { H3Event } from "h3";

export const DEFAULT_ADMIN_USERNAME = "solomonolatunji";

export function getAdminUsernames(): string[] {
  const envVal = process.env.ADMIN_GITHUB_USERNAME;
  if (!envVal) return [DEFAULT_ADMIN_USERNAME.toLowerCase()];
  return envVal
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUsername(username: string | null | undefined): boolean {
  if (!username) return false;
  const list = getAdminUsernames();
  return list.includes(username.trim().toLowerCase());
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

  // Check login handle against admin list
  if (!isAdminUsername(user.username)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: You are not authorized as an administrator.",
    });
  }

  return user;
}
