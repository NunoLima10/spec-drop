import { getSharePreviewBySlug } from "@specdrop/api";
import type { RouterContextProvider } from "react-router";
import { ShareReadPage } from "~/features/share-read/containers/share-read-page";
import type { ShareLoaderData } from "~/features/share-read/types";
import { dbContext, originContext } from "~/lib/router-context";

const defaultSharePreviewTitle = "Shared Markdown";
const sharePreviewDescription =
  "A shared Markdown spec published with SpecsDrop.";

export async function loader({
  context,
  params,
  request,
}: {
  context: RouterContextProvider;
  params: { slug?: string };
  request: Request;
}): Promise<ShareLoaderData> {
  const requestUrl = new URL(request.url);
  const origin = context.get(originContext) ?? requestUrl.origin;
  const db = context.get(dbContext);
  const slug = params.slug ?? "";
  const canonicalUrl = slug
    ? new URL(`/s/${slug}`, origin).toString()
    : requestUrl.toString();

  if (!slug || !db) {
    return {
      canonicalUrl,
      previewTitle: null,
    };
  }

  const preview = await getSharePreviewBySlug(db, slug);

  return {
    canonicalUrl,
    previewTitle: preview?.title ?? null,
  };
}

export function getSharePageTitle(previewTitle: string | null): string {
  return `${previewTitle || defaultSharePreviewTitle} | SpecsDrop`;
}

export function meta({ data }: { data?: ShareLoaderData }) {
  const pageTitle = getSharePageTitle(data?.previewTitle ?? null);
  const url = data?.canonicalUrl;

  return [
    { title: pageTitle },
    {
      name: "description",
      content: sharePreviewDescription,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:site_name",
      content: "SpecsDrop",
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: sharePreviewDescription,
    },
    ...(url
      ? [
          {
            property: "og:url",
            content: url,
          },
        ]
      : []),
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: pageTitle,
    },
    {
      name: "twitter:description",
      content: sharePreviewDescription,
    },
  ];
}

export default function Share() {
  return <ShareReadPage />;
}
