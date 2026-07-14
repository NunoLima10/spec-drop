export function normalizeMarkdownContent(content: string): string {
  return content.replaceAll("\0", "").trimEnd();
}

export const MARKDOWN_CONTENT_MAX_LENGTH = 100_000;
export const MARKDOWN_TITLE_MAX_LENGTH = 120;

export function inferTitleFromMarkdownHeading(markdown: string): string {
  const heading = markdown.match(/^#{1,6}\s+(.+?)\s*#*\s*$/m)?.[1];

  if (!heading) {
    return "";
  }

  return heading
    .replace(/\s+/g, " ")
    .replace(/[*_`~[\]()]/g, "")
    .trim()
    .slice(0, MARKDOWN_TITLE_MAX_LENGTH);
}

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
