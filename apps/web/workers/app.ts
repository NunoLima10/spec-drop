import { trpcServer } from "@hono/trpc-server";
import { appRouter, cleanupExpiredShares } from "@specdrop/api";
import { createDb } from "@specdrop/db";
import { Hono } from "hono";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { dbContext, originContext } from "../app/lib/router-context";

type Bindings = {
  DB: D1Database;
  CREATE_SHARE_RATE_LIMITER: RateLimit;
  READ_SHARE_RATE_LIMITER: RateLimit;
  DELETE_SHARE_RATE_LIMITER: RateLimit;
};

const app = new Hono<{ Bindings: Bindings }>();

type ShareRateLimitTarget = {
  keyPrefix: string;
  limiter: (env: Bindings) => RateLimit;
  message: string;
  retryAfterSeconds: number;
};

const createShareRateLimit: ShareRateLimitTarget = {
  keyPrefix: "share.create",
  limiter: (env) => env.CREATE_SHARE_RATE_LIMITER,
  message: "Too many share creation attempts. Please try again later.",
  retryAfterSeconds: 60,
};

const deleteShareRateLimit: ShareRateLimitTarget = {
  keyPrefix: "share.delete",
  limiter: (env) => env.DELETE_SHARE_RATE_LIMITER,
  message: "Too many share deletion attempts. Please try again later.",
  retryAfterSeconds: 60,
};

const readShareRateLimit: ShareRateLimitTarget = {
  keyPrefix: "share.read",
  limiter: (env) => env.READ_SHARE_RATE_LIMITER,
  message: "Too many share read attempts. Please try again later.",
  retryAfterSeconds: 60,
};

function getClientRateLimitKey(context: {
  req: { header: (name: string) => string | undefined };
}) {
  const connectingIp = context.req.header("cf-connecting-ip")?.trim();
  const forwardedIp = context.req
    .header("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return connectingIp || forwardedIp || "anonymous";
}

function getTrpcProcedures(pathname: string) {
  const encodedProcedures = pathname.replace(/^\/trpc\/?/, "");

  if (!encodedProcedures) {
    return [];
  }

  return encodedProcedures
    .split(",")
    .map((procedure) => decodeURIComponent(procedure).trim())
    .filter(Boolean);
}

function getShareRateLimitTarget(procedures: string[]) {
  if (procedures.includes("share.create")) {
    return createShareRateLimit;
  }

  if (procedures.includes("share.delete")) {
    return deleteShareRateLimit;
  }

  if (procedures.includes("share.bySlug")) {
    return readShareRateLimit;
  }

  return null;
}

app.use("/trpc/*", async (context, next) => {
  const { pathname } = new URL(context.req.url);
  const rateLimitTarget = getShareRateLimitTarget(getTrpcProcedures(pathname));

  if (!rateLimitTarget) {
    await next();
    return;
  }

  const actorKey = getClientRateLimitKey(context);
  const { success } = await rateLimitTarget.limiter(context.env).limit({
    key: `${rateLimitTarget.keyPrefix}:${actorKey}`,
  });

  if (!success) {
    const response = context.json(
      {
        error: {
          message: rateLimitTarget.message,
        },
      },
      429,
    );

    response.headers.set("Retry-After", `${rateLimitTarget.retryAfterSeconds}`);

    return response;
  }

  await next();
});

app.use("/s/*", async (context, next) => {
  const { pathname } = new URL(context.req.url);

  if (!/^\/s\/[^/]+\.md$/.test(pathname)) {
    await next();
    return;
  }

  const actorKey = getClientRateLimitKey(context);
  const { success } = await readShareRateLimit.limiter(context.env).limit({
    key: `${readShareRateLimit.keyPrefix}:${actorKey}`,
  });

  if (!success) {
    const response = context.text(readShareRateLimit.message, 429);

    response.headers.set(
      "Retry-After",
      `${readShareRateLimit.retryAfterSeconds}`,
    );

    return response;
  }

  await next();
});

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
