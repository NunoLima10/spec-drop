const defaultMarkdownBaseName = "shared-markdown";

export function toMarkdownBaseName(title: string | null | undefined) {
  const baseName = (title || defaultMarkdownBaseName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return baseName || defaultMarkdownBaseName;
}

export function getMarkdownFileName(title: string | null | undefined) {
  return `${toMarkdownBaseName(title)}.md`;
}

export function downloadMarkdownFile({
  content,
  title,
}: {
  content: string;
  title: string;
}) {
  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = getMarkdownFileName(title);
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
