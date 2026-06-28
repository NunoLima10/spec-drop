# Contributing

SpecsDrop is built in public and should stay straightforward for outside
contributors to run and review.

## Local Workflow

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Apply local D1 migrations with `pnpm run d1:migrations:local` when working on database flows.
4. Run checks before opening a pull request.

```sh
pnpm run check
pnpm run typecheck
pnpm run build
```

Do not commit dependency folders, generated build output, local environment
files, or generated reference project changes.

## Architecture Notes

- Store raw Markdown in Cloudflare D1.
- Use Cloudflare D1 as the MVP SQL database.
- Render and sanitize Markdown in the web UI.
- Keep package boundaries clear.
- Prefer shared packages for reusable contracts and utilities.
- Keep changes scoped and reviewable.

## Changelog

Notable user-facing or contributor-facing changes must update
`CHANGELOG.md` under `## [Unreleased]`.
