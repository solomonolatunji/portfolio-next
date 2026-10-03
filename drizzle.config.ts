import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "./env";

export default defineConfig({
  dialect: "mysql",
  schema: "./server/db/schema.ts",
  out: "./server/db/migrations/mysql",
  dbCredentials: {
    url: env.MYSQL_URL || process.env.MYSQL_URL || "",
  },
});
