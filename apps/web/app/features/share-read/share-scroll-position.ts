export const SHARE_SCROLL_STORAGE_PREFIX = "specdrop.shareScroll.v1";

export type ShareScrollPersistenceInput = {
  deleteAfterRead?: boolean;
  expiresAt?: string | null;
  maxViews?: number | null;
};

export type ShareScrollPosition = {
  scrollY: number;
  scrollHeight: number;
  viewportHeight: number;
  updatedAt: string;
};

type BrowserStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

const slugPattern = /^[0-9A-Za-z_-]{1,64}$/;

export function canPersistShareScrollPosition({
  deleteAfterRead = false,
  expiresAt = null,
  maxViews = null,
}: ShareScrollPersistenceInput) {
  return !deleteAfterRead && !expiresAt && maxViews === null;
}

export function readShareScrollPosition(
  slug: string,
  storage = getBrowserStorage(),
) {
  if (!storage) {
    return null;
  }

  const storageKey = getShareScrollStorageKey(slug);

  if (!storageKey) {
    return null;
  }

  try {
    const rawValue = storage.getItem(storageKey);

    return rawValue
      ? normalizeStoredScrollPosition(JSON.parse(rawValue))
      : null;
  } catch {
    return null;
  }
}

export function saveShareScrollPosition(
  {
    slug,
    scrollY,
    scrollHeight,
    viewportHeight,
  }: {
    slug: string;
    scrollY: number;
    scrollHeight: number;
    viewportHeight: number;
  },
  storage = getBrowserStorage(),
  now = new Date(),
) {
  if (!storage) {
    return null;
  }

  const storageKey = getShareScrollStorageKey(slug);

  if (!storageKey) {
    return null;
  }

  const position = normalizeScrollPosition({
    scrollY,
    scrollHeight,
    viewportHeight,
    updatedAt: now.toISOString(),
  });

  if (!position) {
    return null;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(position));
  } catch {
    return null;
  }

  return position;
}

export function removeShareScrollPosition(
  slug: string,
  storage = getBrowserStorage(),
) {
  if (!storage) {
    return;
  }

  const storageKey = getShareScrollStorageKey(slug);

  if (!storageKey) {
    return;
  }

  try {
    storage.removeItem(storageKey);
  } catch {
    // Browser storage errors should not block share history cleanup.
  }
}

export function getRestorableScrollY({
  position,
  scrollHeight,
  viewportHeight,
}: {
  position: ShareScrollPosition;
  scrollHeight: number;
  viewportHeight: number;
}) {
  const maxScrollY = Math.max(0, scrollHeight - viewportHeight);

  return Math.min(position.scrollY, maxScrollY);
}

function getShareScrollStorageKey(slug: string) {
  const trimmedSlug = slug.trim();

  return slugPattern.test(trimmedSlug)
    ? `${SHARE_SCROLL_STORAGE_PREFIX}.${trimmedSlug}`
    : null;
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

function normalizeStoredScrollPosition(
  value: unknown,
): ShareScrollPosition | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return normalizeScrollPosition(value as Partial<ShareScrollPosition>);
}

function normalizeScrollPosition({
  scrollY,
  scrollHeight,
  viewportHeight,
  updatedAt,
}: Partial<ShareScrollPosition>) {
  if (
    typeof scrollY !== "number" ||
    typeof scrollHeight !== "number" ||
    typeof viewportHeight !== "number" ||
    typeof updatedAt !== "string"
  ) {
    return null;
  }

  if (
    !Number.isFinite(scrollY) ||
    !Number.isFinite(scrollHeight) ||
    !Number.isFinite(viewportHeight) ||
    Number.isNaN(new Date(updatedAt).getTime())
  ) {
    return null;
  }

  return {
    scrollY: Math.max(0, Math.round(scrollY)),
    scrollHeight: Math.max(0, Math.round(scrollHeight)),
    viewportHeight: Math.max(0, Math.round(viewportHeight)),
    updatedAt,
  };
}
