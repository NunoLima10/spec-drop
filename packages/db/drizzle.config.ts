import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schemas/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  casing: "snake_case",
  verbose: false,
  strict: true,
});
