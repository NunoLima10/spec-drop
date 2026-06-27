# AGENTS.md

This file gives coding agents project-specific guidance for working in SpecsDrop.

## Project Direction

SpecsDrop is an open-source developer tool for publishing Markdown-based technical
documentation as fast, polished, shareable web pages.

The product loop is:

1. Upload or drop a Markdown file.
2. Store the raw Markdown in PostgreSQL.
3. Render it safely in the web UI.
4. Share the generated URL.

## Current Architecture Target

- Package manager: pnpm.
- Monorepo layout: `apps/` and `packages/`.
- Frontend: React, React Router, Vite, Tailwind CSS.
- Backend: Hono and tRPC.
- Data layer: Drizzle ORM, drizzle-kit, postgres-js, PostgreSQL.
- Markdown: raw Markdown storage with sanitized frontend rendering.
- Tooling: TypeScript strict mode, Biome, Vitest, Playwright where useful.

## Documentation Sources

Treat these files as the source of truth before implementation:

- `specs/mission.md`
- `specs/tech-stack.md`
- `specs/roadmap.md`
- `reports.md`

`specs/ideia.md` is the original idea note. Use the newer spec files when there
is a conflict.

## Working Rules

- Keep changes scoped to the current task.
- Prefer existing project decisions in `specs/` over introducing new architecture.
- Use `rg` for file and text search.
- Use `apply_patch` for manual edits.
- Do not edit cloned reference projects unless explicitly asked.
- Do not start long-running dev servers unless the user asks for a runnable app check.
- Do not add generated dependency folders to the repository.

## Open Source Expectations

Public-facing changes should be understandable to outside contributors.

When adding implementation files later, prefer:

- Clear package boundaries.
- Documented setup commands.
- Meaningful names over local shorthand.
- Small, reviewable changes.
- Tests for behavior that affects users, storage, rendering, or sharing rules.

## Changelog Requirement

After completing notable work, update `CHANGELOG.md` under `## [Unreleased]`.

Use `skills/changelog/SKILL.md` for the exact changelog workflow. Skip entries for
pure noise such as whitespace-only changes, test-only changes, or internal
refactors with no behavior or contributor impact.
