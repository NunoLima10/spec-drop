import {
  inferTitleFromMarkdownHeading,
  validateMarkdownContent,
} from "@specdrop/markdown";
import { InvalidShareContentError } from "./shares-errors.js";
import type { ExpirationOption } from "./shares-schema.js";
import { expirationDurations } from "./shares-schema.js";

const slugAlphabet =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

type SharePreviewVisibilityInput = {
  deleteAfterRead: boolean;
  maxViews: number | null;
};

type ShareAvailabilityInput = SharePreviewVisibilityInput & {
  deletedAt: string | null;
  expiresAt: string | null;
  readAt: string | null;
  currentViews: number;
};

type ShareViewInput = SharePreviewVisibilityInput & {
  readAt: string | null;
  currentViews: number;
};

export function createSlug(length = 10): string {
  const values = new Uint8Array(length);
  crypto.getRandomValues(values);

  return Array.from(
    values,
    (value) => slugAlphabet[value % slugAlphabet.length],
  ).join("");
}

export function validateShareContent(content: string) {
  try {
    return validateMarkdownContent(content);
  } catch (error) {
    throw new InvalidShareContentError(
      error instanceof Error ? error.message : undefined,
      { cause: error },
    );
  }
}

export function resolveShareTitle({
  content,
  title,
}: {
  content: string;
  title?: string | null;
}): string | null {
  return title?.trim() || inferTitleFromMarkdownHeading(content) || null;
}

export function shouldExposeSharePreviewTitle(
  share: SharePreviewVisibilityInput,
): boolean {
  return !share.deleteAfterRead && share.maxViews === null;
}

export function getExpiresAt(
  expiresIn: ExpirationOption,
  now = new Date(),
): string | null {
  const duration = expirationDurations[expiresIn];

  if (duration === null) {
    return null;
  }

  return new Date(now.getTime() + duration).toISOString();
}

export function getUnavailableShareMessage(
  share: ShareAvailabilityInput,
  now = new Date(),
): string | null {
  if (share.deletedAt) {
    return "Share was deleted.";
  }

  if (share.expiresAt && new Date(share.expiresAt) <= now) {
    return "Share has expired.";
  }

  if (share.deleteAfterRead && share.readAt) {
    return "Share was deleted after its first view.";
  }

  if (share.maxViews !== null && share.currentViews >= share.maxViews) {
    return "Share view limit reached.";
  }

  return null;
}

export function getShareViewUpdate(share: ShareViewInput, now = new Date()) {
  const viewedAt = now.toISOString();
  const nextViews = share.currentViews + 1;
  const shouldSoftDelete =
    share.deleteAfterRead ||
    (share.maxViews !== null && nextViews >= share.maxViews);

  return {
    currentViews: nextViews,
    readAt: share.readAt ?? viewedAt,
    deletedAt: shouldSoftDelete ? viewedAt : null,
  };
}
