import { appRouter } from "@specdrop/api";
import type { Route } from "./+types/health";

export async function loader(_: Route.LoaderArgs) {
  const caller = appRouter.createCaller({});

  return caller.health.check();
}

export default function Health({ loaderData }: Route.ComponentProps) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <h1 className="font-semibold text-3xl">Health</h1>
      <pre className="mt-6 overflow-auto rounded border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-zinc-950">
        {JSON.stringify(loaderData, null, 2)}
      </pre>
    </main>
  );
}
