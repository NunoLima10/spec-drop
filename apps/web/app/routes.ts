import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("health", "routes/health.tsx"),
  route("s/:slug", "routes/share.tsx"),
  route("favicon.ico", "routes/favicon.ts"),
  route("*", "routes/not-found.tsx"),
] satisfies RouteConfig;
