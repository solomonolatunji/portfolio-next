import { getQuery, getRequestURL, sendRedirect } from "h3";
import { getServerEnv } from "#server/utils/env";
import {
  createSession,
  exchangeGithubCode,
  fetchGithubUser,
  getOAuthState,
  setSessionCookie,
} from "#server/utils/guestbook";
import { errorMessage } from "#server/utils/types";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const code = typeof query.code === "string" ? query.code : null;
  const state = typeof query.state === "string" ? query.state : null;
  if (!code || !state || state !== getOAuthState(event)) {
    const url = new URL("/guestbook", getRequestURL(event));
    url.searchParams.set("error", "Invalid or expired GitHub login session. Please try again.");
    return sendRedirect(event, url.toString(), 302);
  }

  try {
    const env = getServerEnv();
    const accessToken = await exchangeGithubCode(code, env, event);
    const user = await fetchGithubUser(accessToken);
    const session = await createSession(user);
    setSessionCookie(event, session.token);
    return sendRedirect(event, new URL("/guestbook", getRequestURL(event)).toString(), 302);
  } catch (error: unknown) {
    const url = new URL("/guestbook", getRequestURL(event));
    url.searchParams.set("error", errorMessage(error, "GitHub login failed."));
    return sendRedirect(event, url.toString(), 302);
  }
});
