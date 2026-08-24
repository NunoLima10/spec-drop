export const homeReadmeMarkdown = `# readme.md

SpecsDrop turns a local Markdown file into a polished, read-only web page that is easy to send to a teammate, reviewer, stakeholder, phone, tablet, or AI agent.

## The publishing loop

\`\`\`mermaid
flowchart LR
  markdown["Drop README.md"] --> render["Render safely in the browser"]
  render --> share["Share the URL"]
  share --> read["Read on desktop or mobile"]
\`\`\`

## What the page keeps intact

| Markdown feature | Why it matters for technical docs |
| --- | --- |
| Tables | Compare decisions, tradeoffs, options, and API fields. |
| Task lists | Ship specs with visible implementation checkpoints. |
| Code blocks | Keep commands, config, snippets, and examples readable. |
| Mermaid diagrams | Show architecture, sequence, and release flows inline. |

## Built for short handoffs

- [x] Upload or paste Markdown.
- [x] Generate a shareable URL.
- [x] Keep raw Markdown as the source of truth.
- [x] Apply safe rendering, syntax highlighting, tables, and diagrams.
- [x] Make the shared page readable on mobile devices.

\`\`\`ts
const url = await specdrop.publish("implementation-plan.md");
await navigator.clipboard.writeText(url);
\`\`\`

Use it when the document is ready to be read, but not ready to become a repo commit, pull request, gist, or long-lived document workspace.`;
