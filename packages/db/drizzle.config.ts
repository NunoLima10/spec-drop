import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: "../../.env" });
config({ path: ".env", override: true });

export default defineConfig({
  schema: "./src/db/schemas/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
  verbose: false,
  strict: true,
});
