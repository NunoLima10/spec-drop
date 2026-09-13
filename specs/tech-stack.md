# Tech Stack

## Architecture Summary

SpecsDrop will be built as a TypeScript pnpm monorepo with a full-stack web application, a type-safe API layer, and shared packages for reusable contracts and utilities.

The reference projects in this workspace point to two architecture decisions:

- `react-router-hono-fullstack-template`: React Router, Hono, Vite, and Cloudflare Workers as the full-stack runtime model.
- `examples-npm-monorepo`: workspace-based package separation and tRPC-style type sharing between client and server.

The final project should combine these ideas into a pnpm monorepo instead of copying either reference project directly.

## Runtime And Package Manager

- Language: TypeScript.
- Package manager: pnpm.
- Workspace style: pnpm workspaces.
- Runtime target: modern Node.js for local tooling, with the web app designed for edge deployment where practical.
- Module format: ESM.

Recommended workspace shape:

```text
apps/
  web/
packages/
  api/
  db/
  markdown/
  tsconfig/
```

Initial package responsibilities:

- `apps/web`: React Router app, routes, upload UI, share pages, app shell.
- `packages/api`: tRPC routers, procedures, input validation, API context.
- `packages/db`: Drizzle schemas, database client, migrations, seeds, DBML helpers.
- `packages/markdown`: Markdown renderer configuration, sanitizer rules, shared Markdown utilities.
- `packages/tsconfig`: shared TypeScript configuration.

## Frontend

Primary frontend stack:

- React.
- React Router.
- Vite.
- Tailwind CSS.
- shadcn/ui or equivalent accessible component primitives.

Frontend responsibilities:

- Upload or paste Markdown.
- Configure expiration and delete-after-read behavior.
- Display generated share URL and copy action.
- Render shared Markdown documents.
- Provide a polished reading layout with responsive typography.
- Support dark mode.
- Handle expired, deleted, not found, and password-protected future states.

The React Router Hono reference app should guide route organization and the full-stack development loop, but the UI should be built for the product rather than left as template scaffolding.

## Backend

Primary backend stack:

- Hono for request handling and middleware.
- tRPC for type-safe API procedures.
- Zod for input validation.
- Drizzle ORM for database access.
- drizzle-kit for schema migration generation and migration execution.
- Cloudflare D1 as the primary database.

Backend responsibilities:

- Create shares from uploaded Markdown content.
- Return share metadata and raw Markdown to authorized read requests.
- Enforce expiration and delete-after-first-view behavior.
- Track view counts.
- Delete shares.
- Validate Markdown size, title, and option fields.
- Centralize rate limiting and abuse controls.

Hono should own the HTTP edge: request routing, middleware, CORS, health checks, and adapters. tRPC should own application procedures and type-safe client/server contracts.

## Data Layer

Drizzle will be the ORM and migration layer. The setup should use a conventional Drizzle project layout:

- `drizzle.config.ts` at the backend/package root.
- `src/db/index.ts` creates a database client from the Worker `DB` binding.
- `src/db/schemas/index.ts` exports all schema modules.
- `src/db/migrations` stores generated SQL migrations and Drizzle metadata.
- `apps/web/wrangler.jsonc` defines the local and deployed D1 binding.

Cloudflare D1 stores raw Markdown as text. The application should not store rendered HTML as the canonical document format.

Recommended Drizzle config:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schemas/index.ts",
  out: "./src/db/migrations",
  dialect: "sqlite",
  casing: "snake_case",
  verbose: false,
  strict: true,
});
```

Recommended database client:

```ts
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schemas/index.js";

export function createDb(database: D1Database) {
  return drizzle(database, { schema });
}

export type DB = ReturnType<typeof createDb>;
export { schema };
```

Initial `shares` table fields:

- `id`: internal database identifier.
- `slug`: public share identifier, generated with a collision-resistant ID.
- `title`: optional document title.
- `content`: raw Markdown text.
- `createdAt`: creation timestamp.
- `expiresAt`: optional expiration timestamp.
- `readAt`: first-read timestamp, nullable.
- `deleteAfterRead`: boolean.
- `maxViews`: optional maximum view count.
- `currentViews`: current view count.
- `deletedAt`: soft deletion timestamp, nullable.

Future fields:

- `passwordHash`: password-protected links.
- `ownerId`: account ownership.
- `collectionId`: grouped documents.
- `sourceFilename`: uploaded filename.
- `contentHash`: deduplication or integrity checks.

## Markdown Rendering

The Markdown pipeline should follow the security lessons from `reports.md`:

- Store raw Markdown on the backend.
- Render Markdown on the frontend.
- Sanitize rendered output through a strict allowlist.
- Avoid storing generated HTML as source of truth.

Candidate renderer stack:

- ByteMD viewer, or a unified-based custom renderer.
- GitHub Flavored Markdown support.
- Mermaid support.
- Syntax highlighting with Shiki or a ByteMD-compatible highlighting plugin.
- Heading slugs with collision-safe prefixes.
- External link handling with `rel="noopener noreferrer"` and future trust rules.

Required rendering capabilities for MVP:

- Headings.
- Links.
- Lists.
- Tables.
- Task lists.
- Fenced code blocks.
- Syntax highlighting.
- Mermaid diagrams.
- Dark mode styling.

Security requirements:

- Sanitize generated HTML before insertion into the DOM.
- Strip unsafe attributes by default.
- Allow only known safe class names needed for syntax highlighting, Mermaid, and math if math is added later.
- Namespace heading IDs to prevent collisions.
- Validate content length and reject empty or meaningless Markdown.
- Remove null bytes and trim trailing whitespace before persistence.

## API Shape

The MVP API should be small and stable.

Core procedures:

```text
share.create
share.bySlug
share.delete
```

`share.create`:

- Input: title, content, expiration settings, delete-after-read flag.
- Output: share slug, public URL, expiration metadata.

`share.bySlug`:

- Input: slug.
- Output: title, content, createdAt, expiresAt, read state, view state.
- Behavior: rejects expired/deleted shares and applies delete-after-read rules.

`share.delete`:

- Input: slug and deletion token or future authenticated owner context.
- Output: deleted state.

HTTP routes may wrap or expose tRPC procedures, but the client should consume the typed tRPC API wherever possible.

## Deployment

Preferred deployment direction:

- Web and API: Cloudflare Workers.
- Database: Cloudflare D1, accessed through the Worker's `DB` binding.
- Static assets: Vite build output served through the app deployment.
- Future files/images: S3-compatible object storage.
- Scheduled cleanup: cron worker or scheduled job for expired shares.

Local development uses Wrangler's local D1 database. No Docker database service
or connection URL is required. Apply migrations with
`pnpm d1:migrations:local`; deployed migrations use
`pnpm d1:migrations:remote`.

## Development Tooling

Recommended tools:

- TypeScript strict mode.
- Biome for linting and formatting.
- Vitest for unit tests.
- Playwright for smoke and rendering tests.
- Drizzle migrations for schema changes.
- Runtime configuration through Cloudflare bindings and checked deployment configuration.

Recommended scripts:

```text
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm db:generate
pnpm db:check
pnpm db:studio
pnpm d1:migrations:local
pnpm d1:migrations:remote
```

Recommended backend package scripts:

```json
{
  "db:generate": "drizzle-kit generate",
  "db:studio": "drizzle-kit studio",
  "db:check": "drizzle-kit check"
}
```

Recommended root database scripts:

```text
pnpm db:generate
pnpm db:check
pnpm db:studio
pnpm d1:migrations:local
pnpm d1:migrations:remote
```

## Non-Goals For MVP

The MVP should not include:

- Accounts.
- Team workspaces.
- Realtime collaboration.
- Full Markdown editing.
- Billing.
- AI features.
- Image uploads.
- Public discovery or search.

These can be designed later after the upload-to-share loop is reliable.
