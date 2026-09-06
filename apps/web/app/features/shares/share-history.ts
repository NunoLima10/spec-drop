import { removeShareScrollPosition } from "~/features/share-read/share-scroll-position";

export const SHARE_HISTORY_STORAGE_KEY = "specdrop.shareHistory.v1";
export const SHARE_HISTORY_LIMIT = 8;

export type ShareHistorySource = "generated" | "opened";

export type ShareHistoryItem = {
  slug: string;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  lastGeneratedAt: string | null;
  lastOpenedAt: string | null;
};

type ShareHistoryInput = {
  slug: string;
  title?: string | null;
  url: string;
  expiresAt?: string | null;
  deleteAfterRead?: boolean;
  maxViews?: number | null;
  source: ShareHistorySource;
};

type BrowserStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

const slugPattern = /^[0-9A-Za-z_-]{1,64}$/;

export function canSaveShareHistory({
  deleteAfterRead = false,
  expiresAt = null,
  maxViews = null,
}: Pick<ShareHistoryInput, "deleteAfterRead" | "expiresAt" | "maxViews">) {
  return !deleteAfterRead && !expiresAt && maxViews === null;
}

export function readShareHistory(storage = getBrowserStorage()) {
  if (!storage) {
    return [];
  }

  let rawValue: string | null;

  try {
    rawValue = storage.getItem(SHARE_HISTORY_STORAGE_KEY);
  } catch {
    return [];
  }

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeStoredHistoryItem)
      .filter((item): item is ShareHistoryItem => item !== null)
      .slice(0, SHARE_HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function saveShareHistoryItem(
  input: ShareHistoryInput,
  storage = getBrowserStorage(),
  now = new Date(),
) {
  if (!storage) {
    return [];
  }

  const currentItems = readShareHistory(storage);

  if (!canSaveShareHistory(input)) {
    return currentItems;
  }

  const nextItem = normalizeShareHistoryInput(input, currentItems, now);

  if (!nextItem) {
    return currentItems;
  }

  const nextItems = [
    nextItem,
    ...currentItems.filter((item) => item.slug !== nextItem.slug),
  ].slice(0, SHARE_HISTORY_LIMIT);

  writeShareHistory(nextItems, storage);

  return nextItems;
}

export function removeShareHistoryItem(
  slug: string,
  storage = getBrowserStorage(),
) {
  if (!storage) {
    return [];
  }

  const nextItems = readShareHistory(storage).filter(
    (item) => item.slug !== slug,
  );

  writeShareHistory(nextItems, storage);
  removeShareScrollPosition(slug, storage);

  return nextItems;
}

export function clearShareHistory(storage = getBrowserStorage()) {
  if (!storage) {
    return [];
  }

  const currentItems = readShareHistory(storage);

  try {
    storage.removeItem(SHARE_HISTORY_STORAGE_KEY);
    for (const item of currentItems) {
      removeShareScrollPosition(item.slug, storage);
    }
  } catch {
    return readShareHistory(storage);
  }

  return [];
}

function getBrowserStorage(): BrowserStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function normalizeShareHistoryInput(
  input: ShareHistoryInput,
  currentItems: ShareHistoryItem[],
  now: Date,
): ShareHistoryItem | null {
  const slug = normalizeSlug(input.slug);
  const url = normalizeShareUrl(input.url, slug);

  if (!slug || !url) {
    return null;
  }

  const existingItem = currentItems.find((item) => item.slug === slug);
  const timestamp = now.toISOString();
  const title = normalizeTitle(input.title) || existingItem?.title;

  return {
    slug,
    title: title || "Untitled Markdown",
    url,
    createdAt: existingItem?.createdAt ?? timestamp,
    updatedAt: timestamp,
    lastGeneratedAt:
      input.source === "generated"
        ? timestamp
        : (existingItem?.lastGeneratedAt ?? null),
    lastOpenedAt:
      input.source === "opened"
        ? timestamp
        : (existingItem?.lastOpenedAt ?? null),
  };
}

function normalizeStoredHistoryItem(value: unknown): ShareHistoryItem | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const item = value as Partial<ShareHistoryItem>;
  const slug = normalizeSlug(item.slug);
  const url = normalizeShareUrl(item.url, slug);
  const createdAt = normalizeDate(item.createdAt);
  const updatedAt = normalizeDate(item.updatedAt);

  if (!slug || !url || !createdAt || !updatedAt) {
    return null;
  }

  return {
    slug,
    title: normalizeTitle(item.title) || "Untitled Markdown",
    url,
    createdAt,
    updatedAt,
    lastGeneratedAt: normalizeNullableDate(item.lastGeneratedAt),
    lastOpenedAt: normalizeNullableDate(item.lastOpenedAt),
  };
}

function writeShareHistory(items: ShareHistoryItem[], storage: BrowserStorage) {
  try {
    storage.setItem(SHARE_HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Private browsing or storage quota failures should not block sharing.
  }
}

function normalizeSlug(slug: unknown) {
  if (typeof slug !== "string") {
    return null;
  }

  const trimmedSlug = slug.trim();

  return slugPattern.test(trimmedSlug) ? trimmedSlug : null;
}

function normalizeShareUrl(url: unknown, slug: string | null) {
  if (typeof url !== "string" || !slug) {
    return null;
  }

  try {
    const shareUrl = new URL(url);

    if (shareUrl.pathname !== `/s/${slug}`) {
      return null;
    }

    shareUrl.hash = "";
    shareUrl.search = "";

    return shareUrl.toString();
  } catch {
    return null;
  }
}

function normalizeTitle(title: unknown) {
  if (typeof title !== "string") {
    return "";
  }

  return title.trim().slice(0, 120);
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  return Number.isNaN(new Date(value).getTime()) ? null : value;
}

function normalizeNullableDate(value: unknown) {
  return value === null ? null : normalizeDate(value);
}
