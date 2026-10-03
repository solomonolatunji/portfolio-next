import { getRequestURL, sendRedirect } from "h3";

export default defineEventHandler((event) => {
  const url = new URL("/api/spotify/login", getRequestURL(event));
  return sendRedirect(event, url.toString(), 302);
});
