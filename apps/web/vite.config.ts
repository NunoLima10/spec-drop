import { fileURLToPath } from "node:url";
import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));

export default defineConfig(({ command, mode }) => {
  const localEnv =
    command === "serve" ? loadEnv(mode, workspaceRoot, "") : undefined;
  const localPostHogVars: Record<string, string> = {};

  if (localEnv?.POSTHOG_PROJECT_TOKEN && localEnv.POSTHOG_HOST) {
    localPostHogVars.POSTHOG_PROJECT_TOKEN = localEnv.POSTHOG_PROJECT_TOKEN;
    localPostHogVars.POSTHOG_HOST = localEnv.POSTHOG_HOST;
  }

  return {
    plugins: [
      mode === "test"
        ? undefined
        : cloudflare({
            config: (workerConfig) => ({
              vars: {
                ...workerConfig.vars,
                ...localPostHogVars,
              },
            }),
            viteEnvironment: { name: "ssr" },
          }),
      tailwindcss(),
      reactRouter(),
      tsconfigPaths({
        projects: ["./tsconfig.json"],
      }),
    ],
    ssr: {
      noExternal: ["posthog-js", "@posthog/react"],
    },
  };
});
