# Edit Before Generate

## Goal

Let a user drop, choose, or paste Markdown into SpecsDrop, review and edit the
draft in the browser, then generate the public read-only URL only after an
explicit action.

This keeps the product loop fast while removing the risk that a bot-generated
or rough local `.md` file is published before the user has checked it.

## User Value

Developers often receive Markdown from an AI agent, issue template, local script,
or copied notes. That Markdown may need a quick pass before sharing: title
cleanup, removing private notes, fixing headings, trimming prompts, or checking
the rendered result.

The user should be able to:

- Drop a Markdown file without creating a share record.
- Edit the Markdown content before publishing.
- Preview the rendered Markdown while editing.
- Configure expiration, delete-after-read, and max-view rules before publishing.
- Generate a URL only when they intentionally click the generate action.

## Product Behavior

### Draft State

After a file drop, file picker upload, or paste:

- The app creates a local browser draft only.
- No API call to `share.create` runs automatically.
- No slug, share URL, QR code, history item, view count, or database row is
  created.
- The raw Markdown appears in an editable composer.
- The rendered/code preview updates from the current draft.
- The title is inferred from the first Markdown heading or filename until the
  user manually edits the title.

The draft is disposable browser state. Refresh persistence can be considered
later, but the first version should not add accounts, remote drafts, autosave,
or database-backed draft records.

### Generate State

When the user clicks the generate action:

- Client validation runs against the current draft.
- The app calls `share.create` with the current title, content, expiration,
  delete-after-read, and max-view settings.
- The backend validates and normalizes the submitted Markdown exactly as it does
  for direct creation today.
- The backend stores the submitted Markdown as the canonical raw content.
- The response returns the public slug, URL, and share metadata.
- The generated-share result replaces the editor surface.
- Local share history is updated only after successful creation.

## UX Requirements

- The empty state stays focused on dropping or choosing a `.md` or `.markdown`
  file, with paste as a secondary path.
- Once content is loaded, the composer must clearly switch into an editing state.
- The Markdown body editor should be large enough for real specs and resizable
  or scrollable without breaking the surrounding layout.
- The render/code preview must reflect unsaved draft changes before generation.
- The primary button copy should make the boundary clear, such as `Generate URL`
  or `Publish read-only URL`.
- The user must have a `New` or clear-draft action before generation.
- Existing generated-share actions remain unchanged after creation: copy, open,
  delete, QR, and start a new Markdown draft.
- Validation errors should not erase the draft.

## Data And API Requirements

No new backend draft model is required for the first implementation.

Keep `share.create` as the only persistence boundary:

- Input remains the final title/content/options snapshot.
- Output remains the generated slug, URL, and metadata.
- The `shares` table continues to store raw Markdown in `content`.
- The app should not store generated HTML.
- The app should not store draft Markdown in PostgreSQL before generation.

Backend changes should only be needed if current validation or API contracts make
the final draft submit impossible. The intended change is primarily frontend
state and UI behavior.

## Implementation Tasks

1. Update `apps/web/app/features/share-create/components/drop-composer.tsx` so
   the loaded state includes an editable Markdown body textarea, not only title
   and share options.
2. Keep `apps/web/app/features/share-create/containers/share-create-page.tsx`
   as the owner of draft state: title, content, options, preview mode, generated
   URL, and error state.
3. Preserve existing file validation in `upload-utils.ts`.
4. Ensure `readMarkdownFile` and paste changes only update local state.
5. Ensure `handleSubmit` is the only path that calls `trpc.share.create.mutate`.
6. Keep `PreviewStage` wired to the current draft `content`.
7. Add or update tests around the create-share flow:
   - Dropping or selecting Markdown populates an editable draft.
   - Editing the body changes the preview/source content before generation.
   - Dropping a file does not call `share.create`.
   - Clicking generate submits the edited Markdown, not the original file text.
   - Client validation errors preserve the edited draft.
8. Run `pnpm typecheck` and relevant Vitest tests.

## Non-Goals

- No collaborative editing.
- No authenticated saved drafts.
- No draft URLs.
- No autosave to the backend.
- No revision history.
- No post-publication editing of an existing share.
- No change to expiration, delete-after-read, max-view, QR, raw `.md`, or AI
  handoff behavior after a share is generated.

## Security And Privacy Notes

- The draft is not public until `share.create` succeeds.
- The preview still uses the same sanitized Markdown rendering pipeline as
  shared pages.
- Unsaved draft content should not be written to local share history.
- If browser-local draft persistence is added later, it must be explicit in the
  spec because localStorage can retain sensitive Markdown after navigation.

## Acceptance Criteria

- Dropping or choosing a Markdown file never generates a URL by itself.
- Loaded Markdown is editable before URL generation.
- The rendered/code preview updates from the edited content.
- Generating a URL persists the edited content and selected share controls.
- Share history is updated only after a successful generated share.
- Backend storage remains raw Markdown and has no draft rows.
- Relevant tests and typecheck pass.
