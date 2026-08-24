# Web Feature Structure

Feature folders keep product-specific UI and workflow code out of route files.

- `containers/` holds stateful orchestration such as page-level data loading,
  effects, mutations, and composition of several feature components.
- `components/` holds feature-specific presentational pieces such as forms,
  action bars, metadata lists, previews, and skeletons.
- Feature-local helpers live beside the feature when they are not reused across
  the app.
- `features/shares/` holds share-domain helpers reused by multiple share flows,
  such as local share history, share URL transforms, and Markdown file download
  naming.
- `app/components/ui/` is reserved for reusable UI primitives such as buttons,
  inputs, labels, switches, selects, and textareas.
- `app/components/` is for shared app components that are not tied to one
  feature, such as status pages or QR code rendering.
- `app/lib/` is for app infrastructure and cross-domain utilities. Use
  subfolders such as `lib/browser/` and `lib/markdown/` when a category has
  multiple files.

React Router route modules should stay thin: route metadata, loaders, and a
single feature container render.
