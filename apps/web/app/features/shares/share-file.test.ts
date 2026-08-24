import { describe, expect, it } from "vitest";
import { getMarkdownFileName, toMarkdownBaseName } from "./share-file";

describe("share file names", () => {
  it("normalizes titles for Markdown downloads", () => {
    expect(toMarkdownBaseName("API Auth: RFC v2")).toBe("api-auth-rfc-v2");
    expect(getMarkdownFileName("API Auth: RFC v2")).toBe("api-auth-rfc-v2.md");
  });

  it("falls back for blank or missing titles", () => {
    expect(getMarkdownFileName("  ")).toBe("shared-markdown.md");
    expect(getMarkdownFileName(null)).toBe("shared-markdown.md");
  });
});
