import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schemas/index.js";

export function createDb(database: D1Database) {
  return drizzle(database, { schema });
}

export type DB = ReturnType<typeof createDb>;
export { schema };
