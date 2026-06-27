import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("health", "routes/health.tsx"),
  route("favicon.ico", "routes/favicon.ts"),
] satisfies RouteConfig;
