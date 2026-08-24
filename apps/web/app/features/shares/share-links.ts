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
