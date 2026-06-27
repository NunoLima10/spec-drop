import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "SpecsDrop" },
    {
      name: "description",
      content: "Publish Markdown specs as shareable web pages.",
    },
  ];
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <p className="mb-3 font-medium text-sky-700 text-sm uppercase tracking-wide dark:text-sky-300">
        SpecsDrop
      </p>
      <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">
        Drop Markdown, share a polished spec.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-slate-700 leading-8 dark:text-slate-300">
        Phase 0 wires the pnpm workspace, React Router app, Hono edge, tRPC API,
        Drizzle schema, and contributor tooling so the upload-to-share loop can
        build on stable package boundaries.
      </p>
    </main>
  );
}
