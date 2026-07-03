const markdownFilePattern = /\.(md|markdown)$/i;

export function isMarkdownFile(file: Pick<File, "name" | "type">) {
  return (
    markdownFilePattern.test(file.name) ||
    file.type === "text/markdown" ||
    file.type === "text/x-markdown"
  );
}

export function inferTitleFromFileName(fileName: string) {
  return fileName
    .replace(markdownFilePattern, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function inferTitleFromMarkdownHeading(markdown: string) {
  const heading = markdown.match(/^#{1,6}\s+(.+?)\s*#*\s*$/m)?.[1];

  if (!heading) {
    return "";
  }

  return heading
    .replace(/\s+/g, " ")
    .replace(/[*_`~[\]()]/g, "")
    .trim()
    .slice(0, 120);
}

export function inferTitleFromMarkdownUpload({
  content,
  fileName,
}: {
  content: string;
  fileName: string;
}) {
  return (
    inferTitleFromMarkdownHeading(content) || inferTitleFromFileName(fileName)
  );
}

export function getMarkdownFileError(file: Pick<File, "name" | "type">) {
  if (isMarkdownFile(file)) {
    return null;
  }

  return "Choose a Markdown file ending in .md or .markdown.";
}
