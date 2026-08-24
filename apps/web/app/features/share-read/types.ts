export type PreviewMode = "render" | "code";

export type ShareLoaderData = {
  canonicalUrl: string;
  previewTitle: string | null;
};

export type ReadShare = {
  title: string | null;
  content: string;
  createdAt: string;
  expiresAt: string | null;
  deleteAfterRead: boolean;
  maxViews: number | null;
  currentViews: number;
};

export type ShareState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; share: ReadShare };
