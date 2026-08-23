# SpecsDrop

SpecsDrop is an open-source developer tool for publishing Markdown-based
technical documentation as fast, polished, shareable web pages.

The core product loop is:

1. Upload or drop a Markdown file.
2. Store the raw Markdown in Cloudflare D1.
3. Render it safely in the web UI.
4. Share the generated URL.

## Workspace

This repository is a pnpm monorepo.

```text
apps/
  web/            React Router, Hono, Vite, Cloudflare Worker app
packages/
  api/            tRPC routers and typed API contracts
  db/             Drizzle D1 schema and migration workflow
  markdown/       Shared Markdown utilities
  tsconfig/       Shared TypeScript configuration
```

## Setup

Install dependencies:

```sh
pnpm install
```

Copy the local environment template:

```sh
cp .env.example .env
```

Apply D1 migrations to the local Wrangler database:

```sh
pnpm run d1:migrations:local
```

Run the app:

```sh
pnpm run dev
```

`pnpm run dev` starts the web app. In the current Phase 0 architecture, the API
is mounted inside the web app through Hono, so there is no separate `api:dev`
process yet.

Useful local URLs once the app is running:

```text
/           Web app home route
/health     Server-rendered tRPC health check
/trpc/*     tRPC endpoint mounted by Hono
```

Stop the local app:
Use `Ctrl+C` to stop the app process. No local Docker service is required for
the D1 setup.

## Checks

```sh
pnpm run check
pnpm run typecheck
pnpm run build
pnpm run test
```

## Database

The database package owns the Drizzle D1 schema and generated SQL migrations.

```sh
pnpm run db:generate
pnpm run db:check
pnpm run db:studio
pnpm run d1:migrations:local
pnpm run d1:migrations:remote
```

The initial `shares` table stores raw Markdown in the `content` column. Rendered
HTML is not stored as the canonical document format.

For a fresh local D1 database, generate and apply migrations:

```sh
pnpm run db:generate
pnpm run d1:migrations:local
```

The Cloudflare D1 binding lives in `apps/web/wrangler.jsonc`. The committed
`database_id` identifies the D1 database and is not an API secret. Do not commit
API tokens; authenticate locally with `wrangler login` or use a shell-level
`CLOUDFLARE_API_TOKEN`.

## Deployment

Build and deploy the Worker:

```sh
pnpm run web:deploy
```

Apply migrations to the remote D1 database:

```sh
pnpm run d1:migrations:remote
```

The first deployment was verified at:

```text
https://specdrop.codeisland1460.workers.dev
```
