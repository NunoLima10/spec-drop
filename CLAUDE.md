# CLAUDE.md

This project is SpecsDrop, an open-source Markdown sharing tool for developers.

## Read First

Before making product or architecture changes, read:

- `specs/mission.md`
- `specs/tech-stack.md`
- `specs/roadmap.md`
- `reports.md`
- `AGENTS.md`

The current docs override older notes in `specs/ideia.md`.

## Product Summary

SpecsDrop turns local Markdown files into polished shareable web pages.

Core MVP:

- Upload Markdown.
- Store raw Markdown in PostgreSQL.
- Render a public reading page.
- Generate a shareable URL.
- Support expiration.
- Support delete-after-first-view.
- Render technical Markdown safely.

## Stack Direction

- pnpm monorepo.
- React Router web app.
- Hono backend runtime.
- tRPC API.
- Drizzle ORM with PostgreSQL.
- Docker Compose for local PostgreSQL.
- TypeScript strict mode.
- Biome, Vitest, and Playwright where appropriate.

## Contribution Workflow

- Keep changes small and directly tied to the requested task.
- Avoid modifying reference projects unless explicitly requested.
- Preserve the open-source docs as useful onboarding material.
- Update `CHANGELOG.md` after notable completed work.
- Use the changelog skill at `skills/changelog/SKILL.md` for wording and placement.
