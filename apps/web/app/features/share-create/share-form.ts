import type { CreateShareInput, ExpirationOption } from "@specdrop/api";

export type ShareExpiration = ExpirationOption;

type CreateShareDraft = {
  title: string;
  content: string;
  expiresIn: ShareExpiration;
  deleteAfterRead: boolean;
  maxViews: string;
};

type MaxViewsParseResult =
  | { status: "empty" }
  | { status: "invalid" }
  | { status: "ready"; value: number };

const maxShareViews = 10_000;

export function parseMaxViewsInput(value: string): MaxViewsParseResult {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { status: "empty" };
  }

  const maxViews = Number(trimmedValue);

  if (!Number.isInteger(maxViews) || maxViews < 1 || maxViews > maxShareViews) {
    return { status: "invalid" };
  }

  return {
    status: "ready",
    value: maxViews,
  };
}

export function getCreateShareClientError({
  content,
  maxViews,
}: Pick<CreateShareDraft, "content" | "maxViews">) {
  if (!content.trim()) {
    return "Paste or drop Markdown before generating a share URL.";
  }

  if (parseMaxViewsInput(maxViews).status === "invalid") {
    return `Max views must be a whole number from 1 to ${maxShareViews}.`;
  }

  return "";
}

export function buildCreateShareInput({
  title,
  content,
  expiresIn,
  deleteAfterRead,
  maxViews,
}: CreateShareDraft): CreateShareInput {
  const parsedMaxViews = parseMaxViewsInput(maxViews);

  return {
    title: title.trim() || undefined,
    content,
    expiresIn,
    deleteAfterRead,
    maxViews:
      parsedMaxViews.status === "ready" ? parsedMaxViews.value : undefined,
  };
}
