import { describe, expect, it } from "vitest";
import {
  buildAiOpenUrl,
  buildAiReviewPrompt,
  buildMarkdownFileUrl,
} from "./ai-open-links";

describe("AI open links", () => {
  it("builds ChatGPT links with a prefilled prompt parameter", () => {
    const url = new URL(buildAiOpenUrl("chatgpt", "Review this spec"));

    expect(url.origin).toBe("https://chatgpt.com");
    expect(url.pathname).toBe("/");
    expect(url.searchParams.get("prompt")).toBe("Review this spec");
  });

  it("builds Claude links with a prefilled query parameter", () => {
    const url = new URL(buildAiOpenUrl("claude", "Review this spec"));

    expect(url.origin).toBe("https://claude.ai");
    expect(url.pathname).toBe("/new");
    expect(url.searchParams.get("q")).toBe("Review this spec");
  });

  it("creates a context handoff prompt with title, source URL, and markdown content", () => {
    const prompt = buildAiReviewPrompt({
      content: "# API Auth\n\nUse signed tokens.",
      markdownUrl: "https://specdrop.test/s/abc123.md",
      shareUrl: "https://specdrop.test/s/abc123",
      title: "API Auth",
    });

    expect(prompt).toContain("Title: API Auth");
    expect(prompt).toContain(
      "Raw Markdown URL: https://specdrop.test/s/abc123.md",
    );
    expect(prompt).toContain(
      "Rendered page URL: https://specdrop.test/s/abc123",
    );
    expect(prompt).toContain("Do not summarize it yet.");
    expect(prompt).toContain("ask what the user wants to do with it");
    expect(prompt).toContain("The complete Markdown is included below");
    expect(prompt).toContain("# API Auth");
  });

  it("uses the source URL instead of inlining larger markdown content", () => {
    const prompt = buildAiReviewPrompt({
      content: "a".repeat(5000),
      markdownUrl: "https://specdrop.test/s/abc123.md",
      shareUrl: "https://specdrop.test/s/abc123",
      title: "Large Spec",
    });

    expect(prompt).toContain("Use the raw Markdown URL");
    expect(prompt).toContain(
      "Raw Markdown URL: https://specdrop.test/s/abc123.md",
    );
    expect(prompt).not.toContain("Markdown:");
    expect(prompt.length).toBeLessThan(700);
  });

  it("derives the raw Markdown URL when callers only pass the rendered URL", () => {
    const prompt = buildAiReviewPrompt({
      content: "a".repeat(5000),
      shareUrl: "https://specdrop.test/s/abc123",
      title: "Large Spec",
    });

    expect(prompt).toContain(
      "Raw Markdown URL: https://specdrop.test/s/abc123.md",
    );
  });

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
