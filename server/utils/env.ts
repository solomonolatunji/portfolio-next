import type { ServerEnv } from "./types";
import { env } from "~~/env";

export function getServerEnv(): ServerEnv {
  return {
    GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
    SPOTIFY_CLIENT_ID: env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: env.SPOTIFY_CLIENT_SECRET,
    SPOTIFY_REFRESH_TOKEN: env.SPOTIFY_REFRESH_TOKEN,
    SPOTIFY_REDIRECT_URI: env.SPOTIFY_REDIRECT_URI,
  };
}
