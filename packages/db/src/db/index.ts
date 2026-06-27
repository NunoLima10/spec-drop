import { serverEnv } from "@specdrop/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schemas/index.js";

const connectionString = serverEnv.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to create the database client.");
}

const client = postgres(connectionString, {
  max: 10,
  idle_timeout: 60,
  connect_timeout: 30,
  transform: {
    undefined: null,
  },
});

export const db = drizzle(client, { schema });
export type DB = typeof db;
export { schema };
