import { useEffect, useState } from "react";
import { trpc } from "../trpc";

type HealthState =
  | { status: "loading" }
  | { status: "ready"; data: unknown }
  | { status: "error"; message: string };

export default function Health() {
  const [state, setState] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    let isCurrent = true;

    async function checkHealth() {
      try {
        const data = await trpc.health.check.query();

        if (isCurrent) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : "Health check failed.",
          });
        }
      }
    }

    checkHealth();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6">
      <h1 className="font-semibold text-3xl">Health</h1>
      <pre className="mt-6 overflow-auto rounded border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-zinc-950">
        {state.status === "ready"
          ? JSON.stringify(state.data, null, 2)
          : state.status === "error"
            ? state.message
            : "Loading..."}
      </pre>
    </main>
  );
}
