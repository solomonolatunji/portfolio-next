import { getRequestURL, sendRedirect } from "h3";
import { getServerEnv } from "#server/utils/env";
import { githubAuthorizationUrl, newState, setOAuthState } from "#server/utils/guestbook";

export default defineEventHandler((event) => {
  const env = getServerEnv();
  if (!env.GITHUB_CLIENT_ID) {
    const url = new URL("/guestbook", getRequestURL(event));
    url.searchParams.set("error", "GitHub OAuth is not configured. Missing GITHUB_CLIENT_ID on host.");
    return sendRedirect(event, url.toString(), 302);
  }

  const state = newState();
  setOAuthState(event, state);
  return sendRedirect(event, githubAuthorizationUrl(env, event, state).toString(), 302);
});
