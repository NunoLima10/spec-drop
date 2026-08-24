import { describe, expect, it } from "vitest";
import {
  getMarkdownFileError,
  inferTitleFromFileName,
  inferTitleFromMarkdownHeading,
  inferTitleFromMarkdownUpload,
  isMarkdownFile,
} from "./upload-utils";

describe("upload utilities", () => {
  it("accepts Markdown file extensions and rejects other files", () => {
    expect(isMarkdownFile({ name: "plan.md", type: "" })).toBe(true);
    expect(isMarkdownFile({ name: "plan.markdown", type: "" })).toBe(true);
    expect(isMarkdownFile({ name: "plan.txt", type: "text/plain" })).toBe(
      false,
    );
    expect(getMarkdownFileError({ name: "plan.txt", type: "text/plain" })).toBe(
      "Choose a Markdown file ending in .md or .markdown.",
    );
  });

  it("infers readable titles from Markdown filenames", () => {
    expect(inferTitleFromFileName("api-auth_rfc.markdown")).toBe(
      "api auth rfc",
    );
    expect(inferTitleFromFileName("release plan.md")).toBe("release plan");
  });

  it("prefers the first Markdown heading when inferring upload titles", () => {
    expect(
      inferTitleFromMarkdownHeading("# API Authentication RFC\n\nBody"),
    ).toBe("API Authentication RFC");
    expect(
      inferTitleFromMarkdownUpload({
        content: "# Deployment Plan\n\nBody",
        fileName: "notes.md",
      }),
    ).toBe("Deployment Plan");
  });

  it("falls back to the filename when uploaded Markdown has no heading", () => {
    expect(
      inferTitleFromMarkdownUpload({
        content: "This document has no heading.",
        fileName: "release-plan.md",
      }),
    ).toBe("release plan");
  });
});
