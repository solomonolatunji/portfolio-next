import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    MYSQL_URL: z.string().min(1).optional(),
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
    ADMIN_GITHUB_USERNAME: z.string().min(1).optional(),
    CLOUDINARY_URL: z.string().min(1).optional(),
    CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
    CLOUDINARY_API_KEY: z.string().min(1).optional(),
    CLOUDINARY_API_SECRET: z.string().min(1).optional(),
    SPOTIFY_CLIENT_ID: z.string().min(1).optional(),
    SPOTIFY_CLIENT_SECRET: z.string().min(1).optional(),
    SPOTIFY_REFRESH_TOKEN: z.string().min(1).optional(),
    SPOTIFY_REDIRECT_URI: z.string().min(1).optional(),
    NUXT_OG_IMAGE_SECRET: z.string().min(1).optional(),
    SERVER_URL: z.string().url().optional(),
  },

  clientPrefix: "NUXT_PUBLIC_",

  client: {
    NUXT_PUBLIC_SITE_NAME: z.string().min(1).optional(),
    NUXT_PUBLIC_SITE_SHORT_NAME: z.string().min(1).optional(),
    NUXT_PUBLIC_SITE_URL: z.string().min(1).optional(),
    NUXT_PUBLIC_ADMIN_USERNAME: z.string().min(1).optional(),
  },

  runtimeEnv:
    typeof process !== "undefined" && process.env ? process.env : (import.meta as any).env,
  emptyStringAsUndefined: true,
});
