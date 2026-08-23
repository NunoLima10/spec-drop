---
name: changelog
description: >
  Update the changelog after finishing a piece of work, before (or as part of)
  committing. Use this whenever a change is done and about to be committed, or when
  the user asks to "update the changelog", "add a changelog entry", "log this
  change", or runs the commit flow on user-facing or contributor-facing work.
  Writes a human-readable entry in Common Changelog style under the
  `## [Unreleased]` section of the root CHANGELOG.md or affected package
  CHANGELOG.md, creating the file if missing. Skips changes that are not worth
  telling a user or contributor about.
---

# Changelog

SpecsDrop is an open-source project, so notable changes get recorded in a
changelog **written for humans, not from `git log`**. Whenever a piece of work is
finished and about to be committed, add an entry to the right changelog so the
commit and the changelog land together.

The guiding rules, based on Common Changelog and Keep a Changelog:

- **Changelogs are for humans.** Communicate the impact of a change, not the code.
- **Sort by importance**, breaking changes first.
- **Skip what is not important** to a user or contributor.
- **Link each change** to a PR or issue when there is one.

## Where entries go

This is a pnpm monorepo with one product and several internal packages. The root
`CHANGELOG.md` is the default changelog until a package becomes independently
published.

| Changed files under | Changelog file |
|---------------------|----------------|
| `apps/web/` | root `CHANGELOG.md` |
| `packages/api/` | root `CHANGELOG.md` |
| `packages/db/` | root `CHANGELOG.md` |
| `packages/markdown/` | root `CHANGELOG.md` |
| `packages/tsconfig/` | root `CHANGELOG.md` when runtime or tooling support changes |
| `specs/`, `reports.md`, `AGENTS.md`, `CLAUDE.md`, `skills/` | root `CHANGELOG.md` when they change product direction, workflow, or contributor guidance |
| Cross-cutting product milestone or coordinated version bump | root `CHANGELOG.md` |

If a package later ships separately, create a package-level changelog for changes
that only affect that package's consumers.

If the target `CHANGELOG.md` does not exist yet, create it with this header:

```md
# Changelog

## [Unreleased]
```

## What the skill does, each time

1. **See what changed.** Run `git status`, `git diff HEAD`, and `git diff --staged`.
2. **Decide if it is worth logging.** If nothing is user-facing or
   contributor-facing, say so and stop.
3. **Write the entry** in the format below.
4. **Insert it** under `## [Unreleased]` in the right file, in the correct
   category. Create the file or section if missing. Merge with an existing line if
   this work continues something already listed.
5. **Tell the user** exactly what was logged and where, for example:
   "Added 1 entry to `CHANGELOG.md` under Added."

## Entry format

Under `## [Unreleased]`, group entries by category. Categories, in this order,
only the ones that apply:

- `### Changed` - changes in existing functionality
- `### Added` - new functionality
- `### Removed` - removed functionality
- `### Fixed` - bug fixes

Each entry is a single list item:

```md
- <imperative change> (<reference>)
```

- Use imperative mood and present tense: `Add`, `Fix`, `Change`, `Remove`,
  `Bump`, `Document`, `Deprecate`.
- Keep each entry self-describing.
- Keep each entry to one line.
- Reference the PR or issue when there is one.
- Prefix breaking changes with `**Breaking:** ` and list them first.
- Sort within a category: breaking first, then by importance, then newest first.

Example:

```md
# Changelog

## [Unreleased]

### Added

- Add Mermaid rendering to shared Markdown pages

### Fixed

- Prevent expired shares from incrementing view counts
```

## Skip Noise

Do not add an entry for changes a user or contributor would not care about:

- Dotfiles or config with no behavior or workflow change.
- Dev-only dependency bumps.
- Pure formatting, lint, or whitespace.
- Internal refactors with no observable effect.
- Test-only changes.
- The changelog edit itself.

Do not skip:

- Refactors that could change behavior.
- Runtime or environment support changes.
- New or newly documented user-facing features.
- New or newly documented contributor workflows.
- Dependency bumps that change behavior or fix a vulnerability.

## Promote `[Unreleased]` To A Release

When cutting a version:

1. Rename the heading: `## [Unreleased]` to `## [1.4.0] - 2026-06-27`.
2. Groom the entries: merge related lines, drop no-ops, make wording consistent,
   and add missing PR/issue references where possible.
3. Add a fresh empty `## [Unreleased]` above it.
4. Add the reference-style link for the version at the bottom when the repository
   URL is known.

```md
## [Unreleased]

## [1.4.0] - 2026-06-27

### Added

- Add delete-after-first-view sharing

[1.4.0]: https://github.com/<owner>/<repo>/releases/tag/v1.4.0
```

## Antipatterns

- Do not paste commit messages or PR titles verbatim.
- Do not use Conventional Commit prefixes in changelog entries.
- Do not write paragraphs per entry.
- Do not add extra categories unless the project explicitly adopts them.

## Checklist

- Routed to the correct `CHANGELOG.md`; root is the default for this project.
- Entry is imperative, one line, self-describing, with a PR or issue ref if one exists.
- Correct category; breaking changes prefixed and sorted first.
- Skipped pure noise; nothing user-facing or contributor-facing was dropped.
- File or `[Unreleased]` section created if it did not exist.
- Told the user which file and category were updated.
