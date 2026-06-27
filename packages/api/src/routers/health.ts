import { publicProcedure, router } from "../trpc.js";

export const healthRouter = router({
  check: publicProcedure.query(() => ({
    ok: true,
    service: "specdrop-api",
  })),
});
