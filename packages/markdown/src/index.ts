export function normalizeMarkdownContent(content: string): string {
  return content.replaceAll("\0", "").trimEnd();
}

export const MARKDOWN_CONTENT_MAX_LENGTH = 100_000;

export function validateMarkdownContent(content: string): string {
  const normalizedContent = normalizeMarkdownContent(content);
  const plainText = normalizedContent.replace(/[`*_#[\](){}>~|+-]/g, "").trim();

  if (normalizedContent.length === 0 || plainText.length === 0) {
    throw new Error("Markdown content is required.");
  }

  if (normalizedContent.length > MARKDOWN_CONTENT_MAX_LENGTH) {
    throw new Error(
      `Markdown content must be ${MARKDOWN_CONTENT_MAX_LENGTH} characters or fewer.`,
    );
  }

  return normalizedContent;
}
