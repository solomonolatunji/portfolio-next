import { getQuery, getRequestURL, sendRedirect } from "h3";

export default defineEventHandler((event) => {
  const url = new URL("/api/spotify/callback", getRequestURL(event));
  const query = getQuery(event);
  for (const [key, val] of Object.entries(query)) {
    if (typeof val === "string") {
      url.searchParams.set(key, val);
    }
  }
  return sendRedirect(event, url.toString(), 302);
});
