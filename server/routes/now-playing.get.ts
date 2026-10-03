import { getServerEnv } from "#server/utils/env";
import { getNowPlaying } from "#server/utils/music";

export default defineEventHandler(async (event) => {
  try {
    const payload = await getNowPlaying(getServerEnv());
    if (!payload) {
      setResponseStatus(event, 204);
      return null;
    }
    setResponseHeader(event, "Cache-Control", "no-store, max-age=0");
    return payload;
  } catch (error) {
    console.warn(
      "[now-playing] Could not fetch Spotify track:",
      error instanceof Error ? error.message : error
    );
    setResponseStatus(event, 204);
    return null;
  }
});
