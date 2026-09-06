import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DropComposer } from "./drop-composer";

function renderDropComposer(content: string) {
  return renderToStaticMarkup(
    <DropComposer
      canCreate={content.trim().length > 0}
      content={content}
      deleteAfterRead={false}
      error=""
      expiresIn="never"
      handleContentChange={vi.fn()}
      handleDragLeave={vi.fn()}
      handleDragOver={vi.fn()}
      handleDrop={vi.fn()}
      handleFileChange={vi.fn()}
      handleNewMarkdown={vi.fn()}
      handleSubmit={vi.fn()}
      isCreating={false}
      isDraggingFile={false}
      maxViews=""
      setDeleteAfterRead={vi.fn()}
      setExpiresIn={vi.fn()}
      setIsTitleManuallyEdited={vi.fn()}
      setMaxViews={vi.fn()}
      setTitle={vi.fn()}
      title="API Auth"
    />,
  );
}

describe("DropComposer", () => {
  it("shows the ingress surface before Markdown is loaded", () => {
    const markup = renderDropComposer("");

    expect(markup).toContain("Drop md here");
    expect(markup).toContain("Paste Markdown");
    expect(markup).not.toContain("Edit Markdown draft");
  });

  it("shows an editable Markdown draft after content is loaded", () => {
    const markup = renderDropComposer("# API Auth\n\nUse signed tokens.");

    expect(markup).toContain("Markdown draft");
    expect(markup).toContain("Edit Markdown draft");
    expect(markup).toContain("Edit the Markdown before creating a public URL.");
    expect(markup).toContain("# API Auth");
    expect(markup).toContain("Generate URL");
    expect(markup).not.toContain("Drop md here");
  });
});
