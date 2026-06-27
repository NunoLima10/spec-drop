export function normalizeMarkdownContent(content: string): string {
  return content.replaceAll("\0", "").trimEnd();
}
