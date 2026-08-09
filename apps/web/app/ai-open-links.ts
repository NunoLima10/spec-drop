const inlineMarkdownMaxLength = 1500;

export type AiOpenProvider = "chatgpt" | "claude";

export function buildAiReviewPrompt({
  content,
  markdownUrl,
  shareUrl,
  title,
}: {
  content: string;
  markdownUrl: string;
  shareUrl: string;
  title: string;
}) {
  const normalizedContent = content.trim();
  const shouldInlineMarkdown =
    normalizedContent.length > 0 &&
    normalizedContent.length <= inlineMarkdownMaxLength;

  return [
    "Use this Markdown technical document as context for the conversation.",
    "Do not summarize it yet.",
    "First, briefly confirm that you have the document context, then ask what the user wants to do with it.",
    "Offer concise options such as summarizing the context, answering questions, extracting decisions, or listing implementation tasks.",
    shouldInlineMarkdown
      ? "The complete Markdown is included below because it is short."
      : "Use the raw Markdown URL for the exact document source. If you cannot access it, ask the user to paste the relevant section before answering detailed questions.",
    "",
    `Title: ${title}`,
    markdownUrl ? `Raw Markdown URL: ${markdownUrl}` : "",
    shareUrl ? `Rendered page URL: ${shareUrl}` : "",
    "",
    shouldInlineMarkdown ? "Markdown:" : "",
    shouldInlineMarkdown ? normalizedContent : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildAiOpenUrl(provider: AiOpenProvider, prompt: string) {
  const url =
    provider === "chatgpt"
      ? new URL("https://chatgpt.com/")
      : new URL("https://claude.ai/new");

  url.searchParams.set(provider === "chatgpt" ? "prompt" : "q", prompt);

  return url.toString();
}

export function buildMarkdownFileUrl(shareUrl: string) {
  if (!shareUrl) {
    return "";
  }

  try {
    const url = new URL(shareUrl);

    url.pathname = `${url.pathname.replace(/\/$/, "")}.md`;
    url.search = "";
    url.hash = "";

    return url.toString();
  } catch {
    return "";
  }
}
