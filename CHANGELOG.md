# Changelog

## [Unreleased]

### Added

- Add local browser history for stable generated and opened share links.
- Add a README-style Markdown explanation to the home page.
- Add raw Markdown `.md` URLs for shares and AI handoffs.
- Add shared-page actions for opening Markdown review prompts in ChatGPT and Claude.
- Add a home page footer with author credit and GitHub repository star link.
- Add Worker-level rate limiting for share create, read, and delete API calls.
- Add social preview metadata titles for shared Markdown links while hiding titles for view-limited shares.
- Add tests for the QR code component's loading, SVG generation, and invalid/empty URL states.
- Document the QR share code plan for frontend-generated SVG QR codes.
- Add quick actions to shared Markdown pages for render/code viewing, copying, and downloading.
- Add a frosted-glass dark home screen for the Markdown drop-and-share flow.
- Add shadcn UI setup, core form primitives, and React Bits registry access for UI exploration.
- Add drag-and-drop Markdown upload, inferred Markdown titles, reading progress, estimated reading time, and a table of contents on shared pages.
- Add icon-only fullscreen, pinch zoom, button zoom, reset, and panning controls for Mermaid diagrams in shared Markdown pages.
- Add ephemeral sharing controls with expirations, delete-after-read, max views, view tracking, ownerless deletion, and scheduled cleanup.
- Add ByteMD rendering with GFM, line breaks, gemoji, math, syntax highlighting, Mermaid, heading anchors, external-link handling, and sanitizer configuration.
- Add the first Markdown upload, share URL generation, and rendered share viewing flow.
- Add Cloudflare Worker deployment scripts and D1 migration workflow.
- Add root scripts and setup documentation for running the web app and database workflow.
- Add the pnpm monorepo foundation with React Router, Hono, tRPC, Drizzle, and contributor tooling.
- Document the open-source project direction and agent contribution workflow.

### Changed

- Split share API routing into schema, controller, and service modules.
- Serve raw `.md` share URLs as plain UTF-8 text for AI client compatibility.
- Remove the decorative frame around generated share QR codes.
- Reduce QR code panel sizing on generated-share and public share pages.
- Redesign error, not-found, and share loading states with focused SpecsDrop status layouts.
- Redesign shared Markdown read pages with a cleaner dark layout and calmer document typography.
- Move the preview Render/Code toggle above rendered Markdown content.
- Change the empty Markdown uploader to remove the outer frame and place the drop prompt closer to the top.
- Change the create-share home flow to start with a large Markdown drop zone, then switch to a compact composer, page-flow render/code preview, and generated-link handoff after content is loaded.
- Redesign the create-share landing screen around the upload flow, share controls, live preview, and generated-link handoff.
- Document the UI redesign exploration track after completing Phase 4 product polish.
- Advance the roadmap from Phase 3 ephemeral sharing controls to Phase 4 product polish.
- Advance the roadmap from Phase 2 Markdown quality and safety to Phase 3 ephemeral sharing controls.
- Advance the roadmap from Phase 1 Core Share MVP to Phase 2 Markdown quality and safety.
- Switch the initial database target from PostgreSQL to Cloudflare D1.

### Removed

- Remove the unused shared config workspace package.
- Remove redundant README intro copy, design intent panel, and raw storage step from the home page.

### Fixed

- Validate max-view share input before submitting create-share requests.
- Prevent shared Markdown page scrolling from re-rendering Mermaid diagrams.
- Fix pasted Markdown input capture and defer shared Markdown download cleanup.
- Stop exposing raw share database insert details in create-share errors.
- Preserve line breaks when pasting Markdown into the empty uploader.
- Restore readable Markdown page styling after Tailwind resets and rewrite internal heading links, including matching legacy short anchors to generated heading IDs.
- Surface share storage failures instead of retrying non-slug database errors.
- Prevent favicon browser requests from logging React Router 404 errors during development.
