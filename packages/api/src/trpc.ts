import type { DB } from "@specdrop/db";
import { initTRPC } from "@trpc/server";

export type ApiContext = {
  db: DB;
  origin: string;
};

const t = initTRPC.context<ApiContext>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
