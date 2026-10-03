import { getServerEnv } from "#server/utils/env";
import { githubAuthorizationUrl, isSecure, newState, setOAuthState } from "#server/utils/guestbook";

export default defineEventHandler((event) => {
  const env = getServerEnv();
  const query = getQuery(event);
  const redirect =
    typeof query.redirect === "string" &&
    query.redirect.startsWith("/") &&
    !query.redirect.startsWith("//")
      ? query.redirect
      : null;

  if (redirect) {
    setCookie(event, "oauth_redirect", redirect, {
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure(event),
      maxAge: 600,
      path: "/",
    });
  }

  if (!env.GITHUB_CLIENT_ID) {
    const fallbackTarget = redirect || "/guestbook";
    const url = new URL(fallbackTarget, getRequestURL(event));
    url.searchParams.set(
      "error",
      "GitHub OAuth is not configured. Missing GITHUB_CLIENT_ID on host."
    );
    return sendRedirect(event, url.toString(), 302);
  }

  const state = newState();
  setOAuthState(event, state);
  return sendRedirect(event, githubAuthorizationUrl(env, event, state).toString(), 302);
});
