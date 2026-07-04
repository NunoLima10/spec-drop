# QR Share Codes

## Goal

Generate a scannable QR code for every share URL and display it in the web UI.
The QR code is derived from the public URL at render time and is not stored in
the database.

## User Value

QR codes make SpecsDrop links easier to hand off during meetings, demos, mobile
reviews, and projected presentations. A user can generate a Markdown share,
scan the QR code from another device, and open the same public reading page.

## Scope

- Show a real QR code in the generated-share result on the home page.
- Show a QR action or compact QR panel on public shared Markdown pages.
- Render the QR code as SVG.
- Generate the QR code from the canonical share URL only.
- Keep the existing copy, open, delete, render/code, and download actions.
- Avoid storing QR code output or QR-specific fields.

## Non-Goals

- Do not persist QR images, SVG strings, or QR metadata.
- Do not add a backend QR endpoint for the MVP version.
- Do not encode private deletion tokens or internal database identifiers.
- Do not generate QR codes for every Markdown link inside the document body.
- Do not add image uploads, branding overlays, or analytics tracking as part of
  the first version.

## Recommended Approach

Generate QR codes on the frontend.

The QR code is presentation-only, so the browser can derive it from the same
public URL already shown to the user. This keeps the backend focused on share
creation, expiration, and read enforcement. It also avoids adding new storage,
migrations, cache invalidation, or a server rendering path for SVG.

Recommended package:

- `qrcode` `1.5.4` for SVG generation.
- `@types/qrcode` `1.5.6` if the package types are not bundled in the install.

Use `QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 2 })`
behind a small React component such as `ShareQrCode`. The component should
sanitize its input by accepting only a URL string from app state, not arbitrary
Markdown content.

## UX Plan

### Generated Share Result

Replace the current decorative QR-like placeholder in `apps/web/app/routes/home.tsx`
with the real SVG QR for `shareUrl`.

Behavior:

- Render a loading skeleton while the SVG string is being generated.
- Render the SVG inside the existing square visual area.
- Include accessible text that names the target URL.
- Keep the visible share URL input beside the QR code.
- Keep copy, open, new, and delete actions unchanged.

### Public Share Page

Add a small QR action to the shared Markdown page action row in
`apps/web/app/routes/share.tsx`.

Behavior:

- Use the current browser URL as the QR payload.
- Open a compact popover, details panel, or modal with the SVG QR.
- Keep the QR affordance secondary to reading, copying Markdown, and downloading.
- On mobile, avoid taking over the reading layout unless the user opens it.

## Implementation Tasks

1. Add `qrcode` to `apps/web/package.json`.
2. Add `@types/qrcode` if TypeScript requires it.
3. Create `apps/web/app/components/share-qr-code.tsx`.
4. Replace the placeholder QR grid in `ShareResult` with `ShareQrCode`.
5. Add a QR action to `ShareActions` on the public share page.
6. Add tests for the component's loading, generated SVG, and invalid/empty URL
   states.
7. Run `pnpm web:typecheck` and the relevant Vitest suite.

## Security And Privacy Notes

- The QR payload must be exactly the share URL already visible to the user.
- Never include deletion tokens, internal IDs, raw Markdown, or view metadata in
  the QR payload.
- Rendering SVG from a library output should stay isolated in the QR component.
  If `dangerouslySetInnerHTML` is used, it must only receive SVG generated from
  the trusted local QR library and a URL controlled by app state.
- Expired, deleted, or max-view-limited shares need no special QR storage
  behavior because the QR points to the same server-enforced URL.

## Acceptance Criteria

- After creating a share, the generated result displays a real SVG QR code for
  the share URL.
- The QR code is not saved to the database or returned by the API.
- The public share page can display a QR code for its own URL on demand.
- QR rendering works in desktop and mobile layouts without overlapping existing
  actions.
- Typecheck and relevant tests pass.
