import { trpcServer } from "@hono/trpc-server";
import { appRouter, cleanupExpiredShares } from "@specdrop/api";
import { createDb } from "@specdrop/db";
import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { dbContext, originContext } from "../app/router-context";

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
  const origin = new URL(context.req.url).origin;
  const loadContext = new RouterContextProvider();

  loadContext.set(dbContext, createDb(context.env.DB));
  loadContext.set(originContext, origin);

  return requestHandler(context.req.raw, loadContext);
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
