import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@specdrop/api";
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
  }),
);

app.get("*", (context) => {
  const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE,
  );

  return requestHandler(context.req.raw);
});

export default app;
