# Changelog

## [Unreleased]

### Added

- Add Cloudflare Worker deployment scripts and D1 migration workflow.
- Add root scripts and setup documentation for running the web app and database workflow.
- Add the pnpm monorepo foundation with React Router, Hono, tRPC, Drizzle, and contributor tooling.
- Document the open-source project direction and agent contribution workflow.

### Changed

- Switch the initial database target from PostgreSQL to Cloudflare D1.

### Fixed

- Prevent favicon browser requests from logging React Router 404 errors during development.
