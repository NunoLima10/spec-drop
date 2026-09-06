import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShareResult } from "./share-result";

describe("ShareResult", () => {
  it("shows generated share actions without a raw Markdown action", () => {
    const markup = renderToStaticMarkup(
      <ShareResult
        copyStatus=""
        error=""
        handleCopy={vi.fn()}
        handleDeleteShare={vi.fn()}
        handleNewMarkdown={vi.fn()}
        isDeleting={false}
        shareUrl="https://specdrop.test/s/abc123"
        title="API Auth"
      />,
    );

    expect(markup).toContain("Share URL generated");
    expect(markup).toContain("Quick copy");
    expect(markup).toContain("Open");
    expect(markup).toContain("Drop new");
    expect(markup).toContain("Delete");
    expect(markup).not.toContain("Raw .md");
    expect(markup).not.toContain("Raw Markdown URL");
    expect(markup).not.toContain("https://specdrop.test/s/abc123.md");
  });
});
