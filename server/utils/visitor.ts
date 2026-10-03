import type { H3Event } from "h3";
import { getCookie, setCookie } from "h3";
import { randomUUID } from "node:crypto";
import { getGuestbookSession } from "./guestbook";

export const VISITOR_COOKIE = "portfolio_visitor_id";

export async function getVisitorOrUser(event: H3Event): Promise<{
  id: string;
  isGuest: boolean;
  user: { id: string; username: string; avatarUrl: string | null; profileUrl: string } | null;
}> {
  try {
    const user = await getGuestbookSession(event);
    if (user) {
      return {
        id: user.id,
        isGuest: false,
        user,
      };
    }
  } catch {
    // Ignore session failure for guests
  }

  let visitorId = getCookie(event, VISITOR_COOKIE);
  if (!visitorId) {
    visitorId = `v_${randomUUID().replace(/-/g, "")}`;
    setCookie(event, VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return {
    id: visitorId,
    isGuest: true,
    user: null,
  };
}
