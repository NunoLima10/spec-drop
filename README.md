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

## Optional PostHog analytics

SpecsDrop works without PostHog. Analytics is enabled only when both variables
below are configured. For local development, add them to the repository-root
`.env` file:

```env
POSTHOG_PROJECT_TOKEN=your_project_token
POSTHOG_HOST=https://your-posthog-host
```

Before enabling analytics, configure the PostHog project to use **Cookieless
server hash mode** and disable stored IP capture. Restart the development server
after changing `.env`.

For the hosted Cloudflare Worker, set the same values as Worker secrets before
deploying. Run these commands from the repository root and enter each value when
Wrangler prompts:

```sh
pnpm --filter @specdrop/web exec wrangler secret put POSTHOG_PROJECT_TOKEN
pnpm --filter @specdrop/web exec wrangler secret put POSTHOG_HOST
pnpm run web:deploy
```

The hosted app keeps analytics disabled if either binding is missing. Configure
the secrets separately for each Wrangler environment if deployment environments
are added later. These values are delivered to the browser to initialize
PostHog, so do not use a private PostHog personal API key here; use only the
project token and ingestion host.

The integration does not identify users, create person profiles, use analytics
cookies, or record sessions. It sends page views, page leaves, and a small typed
list of product events such as `share created`, `share opened`, and `markdown
downloaded`. Custom events contain only the event name; Markdown, document
titles, share URLs, slugs, and error messages are never included.

See [`specs/analytics.md`](specs/analytics.md) for the complete event inventory,
privacy boundaries, and accuracy limitations.

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
