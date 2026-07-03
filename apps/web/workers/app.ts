import { trpcServer } from "@hono/trpc-server";
import { appRouter, cleanupExpiredShares } from "@specdrop/api";
import { createDb } from "@specdrop/db";
import { Hono } from "hono";
import { createRequestHandler } from "react-router";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => ({
      db: createDb(context.env.DB),
      origin: new URL(context.req.url).origin,
    }),
  }),
);

app.get("*", (context) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
  );

  return requestHandler(context.req.raw);
});

export default {
  fetch(request: Request, env: Bindings, executionContext: ExecutionContext) {
    return app.fetch(request, env, executionContext);
  },
  async scheduled(
    _event: ScheduledEvent,
    env: Bindings,
    _executionContext: ExecutionContext,
  ) {
    await cleanupExpiredShares(createDb(env.DB));
  },
};
