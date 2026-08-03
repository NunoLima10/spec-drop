import { readShareBySlug } from "@specdrop/api";
import type { RouterContextProvider } from "react-router";
import { dbContext } from "~/router-context";

export async function loader({
  context,
  params,
}: {
  context: RouterContextProvider;
  params: { slug?: string };
}) {
  const db = context.get(dbContext);
  const slug = params.slug ?? "";

  if (!slug || !db) {
    return new Response("Share not found.", {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
      status: 404,
    });
  }

  const result = await readShareBySlug(db, slug);

  if (result.status === "not_found") {
    return new Response(result.message, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
      status: 404,
    });
  }

  return new Response(result.share.content, {
    headers: {
      "cache-control": "no-store",
      "content-disposition": `inline; filename="${getMarkdownFileName(
        result.share.title,
      )}"`,
      "content-type": "text/markdown; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

function getMarkdownFileName(title: string | null) {
  const baseName = (title || "shared-markdown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "shared-markdown"}.md`;
}
