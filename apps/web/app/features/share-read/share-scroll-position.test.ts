import { describe, expect, it } from "vitest";
import {
  canPersistShareScrollPosition,
  getRestorableScrollY,
  readShareScrollPosition,
  removeShareScrollPosition,
  SHARE_SCROLL_STORAGE_PREFIX,
  saveShareScrollPosition,
} from "./share-scroll-position";

function createStorage() {
  const values = new Map<string, string>();

  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

describe("share scroll position", () => {
  it("persists scroll position per stable share slug", () => {
    const storage = createStorage();
    const now = new Date("2026-09-05T12:00:00.000Z");

    expect(
      saveShareScrollPosition(
        {
          slug: "abc123",
          scrollY: 420.4,
          scrollHeight: 2400,
          viewportHeight: 800,
        },
        storage,
        now,
      ),
    ).toEqual({
      scrollY: 420,
      scrollHeight: 2400,
      viewportHeight: 800,
      updatedAt: "2026-09-05T12:00:00.000Z",
    });

    expect(readShareScrollPosition("abc123", storage)).toEqual({
      scrollY: 420,
      scrollHeight: 2400,
      viewportHeight: 800,
      updatedAt: "2026-09-05T12:00:00.000Z",
    });
  });

  it("rejects invalid slugs and malformed stored values", () => {
    const storage = createStorage();

    storage.setItem(`${SHARE_SCROLL_STORAGE_PREFIX}.abc123`, "{bad json");

    expect(
      saveShareScrollPosition(
        {
          slug: "../abc123",
          scrollY: 100,
          scrollHeight: 1000,
          viewportHeight: 500,
        },
        storage,
      ),
    ).toBeNull();
    expect(readShareScrollPosition("../abc123", storage)).toBeNull();
    expect(readShareScrollPosition("abc123", storage)).toBeNull();
  });

  it("clamps restored scroll position to the current document height", () => {
    expect(
      getRestorableScrollY({
        position: {
          scrollY: 1600,
          scrollHeight: 3000,
          viewportHeight: 900,
          updatedAt: "2026-09-05T12:00:00.000Z",
        },
        scrollHeight: 1200,
        viewportHeight: 800,
      }),
    ).toBe(400);
  });

  it("removes persisted scroll position for a share slug", () => {
    const storage = createStorage();

    saveShareScrollPosition(
      {
        slug: "abc123",
        scrollY: 420,
        scrollHeight: 2400,
        viewportHeight: 800,
      },
      storage,
      new Date("2026-09-05T12:00:00.000Z"),
    );

    removeShareScrollPosition("abc123", storage);

    expect(readShareScrollPosition("abc123", storage)).toBeNull();
  });

  it("stores scroll only for stable shares", () => {
    expect(canPersistShareScrollPosition({})).toBe(true);
    expect(canPersistShareScrollPosition({ deleteAfterRead: true })).toBe(
      false,
    );
    expect(
      canPersistShareScrollPosition({
        expiresAt: "2026-09-06T12:00:00.000Z",
      }),
    ).toBe(false);
    expect(canPersistShareScrollPosition({ maxViews: 3 })).toBe(false);
  });
});
