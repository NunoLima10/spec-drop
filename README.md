# SpecsDrop

SpecsDrop is an open-source developer tool for publishing Markdown-based
technical documentation as fast, polished, shareable web pages.

The core product loop is:

1. Upload or drop a Markdown file.
2. Store the raw Markdown in PostgreSQL.
3. Render it safely in the web UI.
4. Share the generated URL.

## Workspace

This repository is a pnpm monorepo.

```text
apps/
  web/            React Router, Hono, Vite web app
packages/
  api/            tRPC routers and typed API contracts
  config/         Shared environment parsing
  db/             Drizzle schema, client, and migration workflow
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

Start local PostgreSQL:

```sh
pnpm run docker:up
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

Stop local PostgreSQL:

```sh
pnpm run docker:down
```

## Checks

```sh
pnpm run check
pnpm run typecheck
pnpm run build
pnpm run test
```

## Database

The database package owns Drizzle schema and migration commands.

```sh
pnpm run db:generate
pnpm run db:migrate
pnpm run db:push
pnpm run db:check
pnpm run db:studio
```

The initial `shares` table stores raw Markdown in the `content` column. Rendered
HTML is not stored as the canonical document format.

For a fresh local database, start PostgreSQL, then generate and apply migrations:

```sh
pnpm run docker:up
pnpm run db:generate
pnpm run db:migrate
```
