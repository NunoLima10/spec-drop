# Changelog

## [Unreleased]

### Added

- Add ephemeral sharing controls with expirations, delete-after-read, max views, view tracking, ownerless deletion, and scheduled cleanup.
- Add ByteMD rendering with GFM, line breaks, gemoji, math, syntax highlighting, Mermaid, heading anchors, external-link handling, and sanitizer configuration.
- Add the first Markdown upload, share URL generation, and rendered share viewing flow.
- Add Cloudflare Worker deployment scripts and D1 migration workflow.
- Add root scripts and setup documentation for running the web app and database workflow.
- Add the pnpm monorepo foundation with React Router, Hono, tRPC, Drizzle, and contributor tooling.
- Document the open-source project direction and agent contribution workflow.

### Changed

- Advance the roadmap from Phase 3 ephemeral sharing controls to Phase 4 product polish.
- Advance the roadmap from Phase 2 Markdown quality and safety to Phase 3 ephemeral sharing controls.
- Advance the roadmap from Phase 1 Core Share MVP to Phase 2 Markdown quality and safety.
- Switch the initial database target from PostgreSQL to Cloudflare D1.

### Fixed

- Restore readable Markdown page styling after Tailwind resets and rewrite internal heading links, including matching legacy short anchors to generated heading IDs.
- Surface share storage failures instead of retrying non-slug database errors.
- Prevent favicon browser requests from logging React Router 404 errors during development.
