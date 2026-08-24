import { trpcServer } from "@hono/trpc-server";
import { appRouter, cleanupExpiredShares } from "@specdrop/api";
import { createDb } from "@specdrop/db";
import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { dbContext, originContext } from "../app/lib/router-context";
import type { WorkerBindings } from "./bindings";
import {
  enforceRawMarkdownReadRateLimit,
  enforceTrpcShareRateLimit,
} from "./rate-limit";

const app = new Hono<{ Bindings: WorkerBindings }>();

app.use("/trpc/*", enforceTrpcShareRateLimit);
app.use("/s/*", enforceRawMarkdownReadRateLimit);

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
  fetch(
    request: Request,
    env: WorkerBindings,
    executionContext: ExecutionContext,
  ) {
    return app.fetch(request, env, executionContext);
  },
  async scheduled(
    _event: ScheduledEvent,
    env: WorkerBindings,
    _executionContext: ExecutionContext,
  ) {
    await cleanupExpiredShares(createDb(env.DB));
  },
};
