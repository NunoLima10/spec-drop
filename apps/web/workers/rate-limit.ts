import type { Context, Next } from "hono";
import type { WorkerBindings } from "./bindings";

type WorkerContext = Context<{ Bindings: WorkerBindings }>;

type ShareRateLimitTarget = {
  keyPrefix: string;
  limiter: (env: WorkerBindings) => RateLimit;
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

function getClientRateLimitKey(context: WorkerContext) {
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

function applyRetryAfter(response: Response, retryAfterSeconds: number) {
  response.headers.set("Retry-After", `${retryAfterSeconds}`);

  return response;
}

export async function enforceTrpcShareRateLimit(
  context: WorkerContext,
  next: Next,
) {
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
    return applyRetryAfter(
      context.json(
        {
          error: {
            message: rateLimitTarget.message,
          },
        },
        429,
      ),
      rateLimitTarget.retryAfterSeconds,
    );
  }

  await next();
}

export async function enforceRawMarkdownReadRateLimit(
  context: WorkerContext,
  next: Next,
) {
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
    return applyRetryAfter(
      context.text(readShareRateLimit.message, 429),
      readShareRateLimit.retryAfterSeconds,
    );
  }

  await next();
}
