export type WorkerBindings = {
  DB: D1Database;
  CREATE_SHARE_RATE_LIMITER: RateLimit;
  READ_SHARE_RATE_LIMITER: RateLimit;
  DELETE_SHARE_RATE_LIMITER: RateLimit;
};
