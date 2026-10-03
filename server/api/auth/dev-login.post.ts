import { createSession, setSessionCookie } from "#server/utils/guestbook";
import { env } from "~~/env";

export default defineEventHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({
      statusCode: 403,
      statusMessage: "Dev login is only available in local development.",
    });
  }

  const adminHandle = (env.ADMIN_GITHUB_USERNAME || "solomonolatunji").split(",")[0]!.trim();
  const devUser = {
    id: "dev-admin-1",
    username: adminHandle,
    avatarUrl: `https://github.com/${adminHandle}.png`,
    profileUrl: `https://github.com/${adminHandle}`,
  };

  const session = await createSession(devUser);
  setSessionCookie(event, session.token);

  return { ok: true, user: { ...devUser, isAdmin: true } };
});
