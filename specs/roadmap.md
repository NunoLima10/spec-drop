# Roadmap

## Phase 0: Project Foundation - Complete

Goal: turn the current reference material into an executable pnpm monorepo.

Deliverables:

- Create pnpm workspace.
- Add shared TypeScript configuration.
- Add `apps/web`.
- Add `packages/api`.
- Add `packages/db` with Drizzle schemas, migrations, and client setup.
- Add `packages/markdown`.
- Wire React Router, Hono, and Vite into the web app.
- Wire tRPC between the frontend and backend.
- Add Drizzle, drizzle-kit, postgres-js, and initial PostgreSQL connection.
- Add Docker Compose with a local PostgreSQL service.
- Add Make targets for Docker and database workflow.
- Add basic environment validation.
- Add root scripts for dev, build, typecheck, lint, test, and Drizzle commands.
- Add open-source project files: license, readme, contributing guide, changelog, and agent guidance.

Exit criteria:

- `pnpm dev` starts the local app.
- Frontend can call a typed tRPC health procedure.
- Drizzle can connect to the local Docker PostgreSQL database.
- `pnpm db:generate`, `pnpm db:migrate`, and `pnpm db:studio` are wired.
- The project has a clear package structure that future features can build on.
- Contributors can understand setup, architecture, and changelog expectations from the repository docs.

Status: complete.

## Phase 1: Core Share MVP - Complete

Goal: upload Markdown, store it, render it, and share it by URL.

Deliverables:

- Upload or paste Markdown from the web UI.
- Validate Markdown content before persistence.
- Create a share record through Drizzle.
- Generate a public slug.
- Return a shareable URL.
- Implement public share page.
- View the stored raw Markdown document.
- Add copy URL action.
- Add not found and invalid document states.
- Render Markdown from raw stored content.
- Add responsive reading layout.
- Add dark mode.

Current phase-one boundary:

- Upload or choose a `.md` or `.markdown` file.
- Generate a public share URL.
- Open the share URL and view the stored Markdown content.
- Defer polished Markdown rendering and visual treatment until after the
  upload-generate-view loop is working end to end.

Exit criteria:

- A user can create a share from Markdown and open the generated URL in a browser.
- Stored content remains raw Markdown.
- The reading page supports common developer documentation patterns: headings, links, tables, lists, and code blocks.

Status: complete.

## Phase 2: Markdown Quality And Safety - Complete

Goal: make rendering good enough for real technical documents and safe enough for public links.

Deliverables:

- Add GitHub Flavored Markdown support.
- Add syntax highlighting.
- Add Mermaid rendering.
- Add heading anchors.
- Add collision-safe heading ID prefixing.
- Add external link policy.
- Add strict sanitizer configuration.
- Add content length limits.
- Add null byte removal.
- Add trailing whitespace trim.
- Add empty or meaningless Markdown rejection.
- Add rendering tests for code blocks, links, tables, Mermaid, and unsafe HTML.

Exit criteria:

- Markdown renders with production-quality typography and code formatting.
- Unsafe HTML and unsafe attributes are stripped.
- Mermaid diagrams render without breaking the page.
- The app has tests for the most important rendering and sanitization cases.

Status: complete.

## Phase 3: Ephemeral Sharing Controls - Complete

Goal: make temporary sharing a first-class part of the product.

Deliverables:

- Expiration options in the create-share flow.
- Expiration enforcement in `share.bySlug`.
- Delete-after-first-view support.
- View count tracking.
- Optional max view count support.
- Expired page state.
- Deleted page state.
- Cleanup job for expired records.
- Deletion token or ownerless delete mechanism for MVP.

Exit criteria:

- Users can create temporary links.
- Expired and deleted shares are unavailable.
- Delete-after-read behavior is enforced server-side.
- Cleanup can remove or soft-delete expired shares.

Status: complete.

## Phase 4: Product Polish - Current

Goal: make the core flow feel fast, deliberate, and developer-first.

Deliverables:

- Drag-and-drop upload.
- File name to title inference.
- Better create-share form states.
- Loading, error, expired, deleted, and empty states.
- Reading progress.
- Estimated reading time.
- Table of contents.
- Mobile layout pass.
- Accessibility pass.
- Basic analytics or operational events.

Exit criteria:

- The MVP is usable without explanation.
- The page feels polished on desktop and mobile.
- Common failure states are handled clearly.

Status: active.

## Phase 5: Developer Workflow Extensions

Goal: let developers publish from where they already write Markdown.

Deliverables:

- CLI prototype: `spec-drop README.md`.
- Clipboard copy after CLI upload.
- VS Code extension spike.
- GitHub Action spike.
- API token design for future authenticated publishing.
- Public API documentation for creating shares.

Exit criteria:

- A developer can publish a Markdown file without opening the web UI.
- The API surface is stable enough for first-party workflow tools.

## Phase 6: AI-Assisted Documentation

Goal: add optional intelligence around shared specs without changing the core read-only publishing model.

Deliverables:

- Generate summary.
- Extract decisions.
- Extract TODOs.
- Generate implementation checklist.
- Suggest reviewers or domains.
- Ask questions about the document.
- Generate or refine Mermaid diagrams.

Exit criteria:

- AI features are opt-in.
- The raw Markdown remains the source of truth.
- AI output is clearly separated from the uploaded document.

## Phase 7: Teams And Persistence

Goal: support long-lived documentation workflows after the ephemeral product works.

Deliverables:

- Accounts.
- Collections.
- Organization workspaces.
- Permanent links.
- Password-protected links.
- Custom domains or branded pages.
- Audit history.
- Billing exploration.

Exit criteria:

- Teams can organize shared specs without compromising the fast anonymous sharing flow.

## MVP Scope Boundary

The first production milestone should include only:

- pnpm monorepo.
- React Router web app.
- Hono backend runtime.
- tRPC API.
- Drizzle and PostgreSQL.
- Markdown create/read/delete.
- Public share page.
- Secure Markdown rendering.
- Expiration.
- Delete-after-first-view.
- Basic tests.

Everything else should wait until the central loop is reliable: drop Markdown, get URL, share.
