import { describe, expect, it } from "vitest";
import { buildMarkdownFileUrl } from "./share-links";

describe("share links", () => {
  it("builds raw Markdown URLs from shared page URLs", () => {
    expect(buildMarkdownFileUrl("https://specdrop.test/s/abc123")).toBe(
      "https://specdrop.test/s/abc123.md",
    );
    expect(buildMarkdownFileUrl("https://specdrop.test/s/abc123/")).toBe(
      "https://specdrop.test/s/abc123.md",
    );
    expect(buildMarkdownFileUrl("not-a-url")).toBe("");
  });
});
