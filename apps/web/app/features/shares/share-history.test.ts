import { describe, expect, it } from "vitest";
import {
  canSaveShareHistory,
  clearShareHistory,
  readShareHistory,
  removeShareHistoryItem,
  SHARE_HISTORY_LIMIT,
  SHARE_HISTORY_STORAGE_KEY,
  saveShareHistoryItem,
} from "./share-history";

class MemoryStorage
  implements Pick<Storage, "getItem" | "removeItem" | "setItem">
{
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("share history", () => {
  it("stores generated and opened links once per share slug", () => {
    const storage = new MemoryStorage();
    const generatedAt = new Date("2026-08-21T10:00:00.000Z");
    const openedAt = new Date("2026-08-21T11:00:00.000Z");

    saveShareHistoryItem(
      {
        slug: "abc123",
        title: "API Auth",
        url: "https://specdrop.test/s/abc123",
        expiresAt: null,
        deleteAfterRead: false,
        maxViews: null,
        source: "generated",
      },
      storage,
      generatedAt,
    );

    const items = saveShareHistoryItem(
      {
        slug: "abc123",
        title: "API Auth",
        url: "https://specdrop.test/s/abc123",
        expiresAt: null,
        deleteAfterRead: false,
        maxViews: null,
        source: "opened",
      },
      storage,
      openedAt,
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      slug: "abc123",
      title: "API Auth",
      url: "https://specdrop.test/s/abc123",
      createdAt: generatedAt.toISOString(),
      updatedAt: openedAt.toISOString(),
      lastGeneratedAt: generatedAt.toISOString(),
      lastOpenedAt: openedAt.toISOString(),
    });
  });

  it("skips restricted shares", () => {
    const storage = new MemoryStorage();

    expect(
      canSaveShareHistory({
        expiresAt: "2026-08-22T10:00:00.000Z",
        deleteAfterRead: false,
        maxViews: null,
      }),
    ).toBe(false);
    expect(
      canSaveShareHistory({
        expiresAt: null,
        deleteAfterRead: true,
        maxViews: null,
      }),
    ).toBe(false);
    expect(
      canSaveShareHistory({
        expiresAt: null,
        deleteAfterRead: false,
        maxViews: 3,
      }),
    ).toBe(false);

    expect(
      saveShareHistoryItem(
        {
          slug: "abc123",
          title: "Hidden Share",
          url: "https://specdrop.test/s/abc123",
          expiresAt: null,
          deleteAfterRead: false,
          maxViews: 1,
          source: "opened",
        },
        storage,
      ),
    ).toEqual([]);
  });

  it("normalizes, limits, removes, and clears history entries", () => {
    const storage = new MemoryStorage();

    storage.setItem(
      SHARE_HISTORY_STORAGE_KEY,
      JSON.stringify([
        {
          slug: "abc123",
          title: "  API Auth  ",
          url: "https://specdrop.test/s/abc123?utm=1#top",
          createdAt: "2026-08-21T10:00:00.000Z",
          updatedAt: "2026-08-21T10:00:00.000Z",
          lastGeneratedAt: null,
          lastOpenedAt: null,
        },
        {
          slug: "bad/slug",
          title: "Bad",
          url: "https://specdrop.test/s/bad/slug",
          createdAt: "2026-08-21T10:00:00.000Z",
          updatedAt: "2026-08-21T10:00:00.000Z",
          lastGeneratedAt: null,
          lastOpenedAt: null,
        },
      ]),
    );

    expect(readShareHistory(storage)).toEqual([
      {
        slug: "abc123",
        title: "API Auth",
        url: "https://specdrop.test/s/abc123",
        createdAt: "2026-08-21T10:00:00.000Z",
        updatedAt: "2026-08-21T10:00:00.000Z",
        lastGeneratedAt: null,
        lastOpenedAt: null,
      },
    ]);

    for (let index = 0; index < SHARE_HISTORY_LIMIT + 2; index += 1) {
      saveShareHistoryItem(
        {
          slug: `share${index}`,
          title: `Share ${index}`,
          url: `https://specdrop.test/s/share${index}`,
          expiresAt: null,
          deleteAfterRead: false,
          maxViews: null,
          source: "generated",
        },
        storage,
        new Date(`2026-08-21T10:${String(index).padStart(2, "0")}:00.000Z`),
      );
    }

    expect(readShareHistory(storage)).toHaveLength(SHARE_HISTORY_LIMIT);
    expect(removeShareHistoryItem("share9", storage)).toHaveLength(
      SHARE_HISTORY_LIMIT - 1,
    );
    expect(clearShareHistory(storage)).toEqual([]);
    expect(readShareHistory(storage)).toEqual([]);
  });
});
