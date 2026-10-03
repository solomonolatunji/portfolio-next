import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "#server/db/schema";
import { env } from "~~/env";

type PortfolioDatabase = MySql2Database<typeof schema>;

let database: PortfolioDatabase | undefined;
let databaseUrl: string | undefined;

export function getDb() {
  const connectionString = env.MYSQL_URL;

  if (!connectionString) {
    throw new Error("MySQL is not configured. Provide MYSQL_URL.");
  }

  if (!database || databaseUrl !== connectionString) {
    database = drizzle({
      connection: {
        uri: connectionString,
        disableEval: true,
      },
      schema,
      mode: "default",
    });
    databaseUrl = connectionString;
  }

  return database;
}
