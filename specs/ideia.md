# Project Foundation

> Working names:
>
> * **DropMD** ⭐
> * **NimbusMD**
> * **SpecsDrop**

---

# Mission

Developers are increasingly writing software through specifications, plans, architecture documents, and AI prompts stored as Markdown files.

Despite this shift, sharing these documents is still unnecessarily complicated. Developers often create temporary commits, push unfinished work, or copy and paste Markdown into collaborative editors simply to share a document or read it on another device.

Our mission is to make sharing technical documentation as effortless as sharing an image.

Drag a Markdown file.
Receive a beautiful URL.
Share it instantly.

No repository.
No account.
No friction.

---

# Vision

Become the fastest way to publish and share developer documentation.

Long term, the platform should become the standard tool for sharing AI specifications, implementation plans, architecture documents, ADRs, prompts, RFCs, and technical notes.

Markdown is only the beginning.

---

# Problem

Current workflows introduce unnecessary friction.

Examples:

* Creating commits just to read a specification on a phone.
* Opening Pull Requests for work that isn't ready.
* Creating GitHub Gists for temporary sharing.
* Copying Markdown into Notion or HackMD.
* Sharing raw Markdown instead of a pleasant reading experience.

Developers need something much simpler.

---

# Core Principles

## Instant

Sharing a document should take seconds.

## Read-only by default

This is not another collaborative editor.

It is a publishing tool.

## Beautiful reading experience

Focus on reading rather than editing.

Typography matters.

Code blocks matter.

Tables matter.

Mermaid diagrams should work automatically.

## Ephemeral first

Not every document should live forever.

Temporary sharing should be a first-class feature.

## Developer-first

Every interaction should feel like it belongs in a modern engineering workflow.

---

# MVP

Upload a Markdown file.

Render it beautifully.

Generate a shareable URL.

Support expiration.

Support delete-after-first-view.

Mobile friendly.

Dark mode.

Syntax highlighting.

GitHub Flavored Markdown.

---

# Future Features

## Sharing

* Password protected links
* Custom expiration
* Maximum number of views
* Private links
* Permanent links

## Reading

* Reading progress
* Estimated reading time
* Table of contents
* Search inside document
* Mermaid rendering
* Math support
* Footnotes

## Developer Workflow

VS Code Extension

Right click

Share Markdown

CLI

```
mdshare PLAN.md
```

Clipboard automatically receives the URL.

Git hooks

GitHub Action

Drag & Drop Desktop App

Raycast Extension

---

# AI Features

Generate summary.

Extract decisions.

Extract TODOs.

Explain architecture.

Generate implementation checklist.

Suggest reviewers.

Generate Mermaid diagrams.

Ask questions about the document.

---

# Technical Stack

## Frontend

React

Vite

Tailwind CSS

Existing Markdown renderer

Shiki for syntax highlighting

Mermaid

## Backend

Fastify

TypeScript

Drizzle ORM

PostgreSQL

NanoID

## Storage

Markdown stored directly as text inside PostgreSQL.

Images (future) stored in object storage.

## Infrastructure

Docker

Coolify

Cloudflare

S3-compatible storage (future)

Cron worker for cleanup.

---

# Data Model

Share

* id
* content
* title
* createdAt
* expiresAt
* readAt
* deleteAfterRead
* maxViews
* currentViews
* passwordHash (future)

---

# API

POST /shares

Creates a new share.

GET /shares/:id

Returns rendered document.

DELETE /shares/:id

Deletes a share.

---

# Roadmap

## Phase 1

Core sharing.

* Upload Markdown
* Beautiful renderer
* Copy URL
* Expiration
* Delete after first read

## Phase 2

Developer workflow.

* CLI
* VS Code Extension
* Drag & Drop
* Mobile optimization

## Phase 3

AI layer.

* Summary
* Search
* Questions
* Architecture extraction
* TODO extraction

## Phase 4

Teams.

* Accounts
* Collections
* Shared workspaces
* Organization branding

---

# Long-term Vision

Imagine this workflow:

```
Finish writing PLAN.md

↓

Run

mdshare PLAN.md

↓

https://dropmd.dev/Ab2kF

↓

Open on your phone.

Send to your teammate.

Ask your AI agent to review it.

Done.
```

Sharing technical documentation should feel as effortless as sharing a screenshot.

That is the product.
