# Mission

## Product

SpecsDrop is a fast publishing tool for Markdown-based developer documentation.

The core workflow is simple:

1. Drag or upload a Markdown file.
2. Store the raw Markdown safely on the backend.
3. Render it as a polished reading page.
4. Share the generated URL.

The product is not a collaborative editor, a repository, or a project management system. It is a focused way to turn technical Markdown into a readable, shareable web page without forcing developers to create temporary commits, pull requests, gists, or copied documents in another tool.

## Why It Exists

Modern software work increasingly happens through written artifacts: specs, AI prompts, implementation plans, architecture notes, RFCs, ADRs, release plans, and review documents. These files often begin as local Markdown, but the sharing workflow is still clumsy.

Developers should not need to push unfinished work, expose a repository branch, or paste Markdown into a general-purpose document editor just to show someone a spec. Sharing technical documentation should feel as direct as sharing an image or screenshot.

## Target Users

The first users are developers and technical teams who already write in Markdown and need a lightweight way to share read-only documents.

Primary use cases:

- Share an implementation plan with a teammate.
- Open a spec on a phone or tablet without pushing code.
- Send an architecture note to an AI agent, reviewer, or stakeholder.
- Publish a temporary document that should expire automatically.
- Present Markdown with good typography, code highlighting, tables, and diagrams.

## Core Principles

### Open Source

SpecsDrop should be built in public with clear documentation, readable architecture, and contributor-friendly workflows.

### Instant Sharing

The primary action should take seconds. A user should be able to upload a Markdown file and receive a shareable URL with minimal decisions.

### Read-Only by Default

SpecsDrop is a publishing surface, not an editor-first collaboration tool. Editing may exist later, but the MVP should optimize for upload, render, share, and delete.

### Beautiful Technical Reading

The reading page must treat developer documentation as a first-class medium. Typography, code blocks, tables, headings, links, Mermaid diagrams, and mobile layout matter.

### Raw Markdown as the Source of Truth

The backend stores Markdown as text in PostgreSQL. Rendering happens through a controlled Markdown pipeline on the web frontend, using sanitization and strict validation instead of storing generated HTML.

### Ephemeral First

Temporary documents are a feature, not an edge case. Expiration, delete-after-first-view, and future view limits should be part of the product model from the beginning.

### Developer Workflow Native

The product should feel natural in engineering workflows: web upload first, then CLI, VS Code, GitHub Actions, and other automation surfaces after the MVP proves the core loop.

## MVP Outcome

The MVP succeeds when a developer can upload a Markdown file, receive a URL, and share a polished read-only page that supports:

- GitHub Flavored Markdown.
- Syntax-highlighted code blocks.
- Tables and task lists.
- Mermaid diagrams.
- Dark mode.
- Mobile-friendly reading.
- Expiration.
- Delete-after-first-view.

## Long-Term Vision

SpecsDrop should become the fastest way to publish and share developer documentation.

Markdown is the starting point. Over time, the platform can support richer technical workflows: AI-generated summaries, extracted TODOs, decision logs, implementation checklists, architecture diagrams, document Q&A, and team collections.

The long-term product promise stays the same:

Write the spec locally. Drop it into the app. Share the URL. Move on.
