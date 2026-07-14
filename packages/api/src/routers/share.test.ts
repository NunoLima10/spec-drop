import { describe, expect, it } from "vitest";
import {
  getExpiresAt,
  getShareViewUpdate,
  getUnavailableShareMessage,
  resolveShareTitle,
  shouldExposeSharePreviewTitle,
} from "./share.js";

const now = new Date("2026-06-30T12:00:00.000Z");

function createShare(overrides = {}) {
  return {
    deletedAt: null,
    expiresAt: null,
    deleteAfterRead: false,
    readAt: null,
    maxViews: null,
    currentViews: 0,
    ...overrides,
  };
}

describe("share lifecycle", () => {
  it("resolves share titles from explicit input or Markdown headings", () => {
    expect(
      resolveShareTitle({
        title: "Explicit Spec Title",
        content: "# Markdown Title\n\nBody",
      }),
    ).toBe("Explicit Spec Title");

    expect(
      resolveShareTitle({
        title: "",
        content: "# Markdown Title\n\nBody",
      }),
    ).toBe("Markdown Title");

    expect(
      resolveShareTitle({
        title: "",
        content: "Body without a heading.",
      }),
    ).toBeNull();
  });

  it("hides preview titles for view-limited shares", () => {
    expect(
      shouldExposeSharePreviewTitle(
        createShare({ deleteAfterRead: true, maxViews: null }),
      ),
    ).toBe(false);

    expect(
      shouldExposeSharePreviewTitle(
        createShare({ deleteAfterRead: false, maxViews: 3 }),
      ),
    ).toBe(false);

    expect(
      shouldExposeSharePreviewTitle(
        createShare({ deleteAfterRead: false, maxViews: null }),
      ),
    ).toBe(true);
  });

  it("computes expiration timestamps from create options", () => {
    expect(getExpiresAt("never", now)).toBeNull();
    expect(getExpiresAt("1h", now)).toBe("2026-06-30T13:00:00.000Z");
    expect(getExpiresAt("24h", now)).toBe("2026-07-01T12:00:00.000Z");
    expect(getExpiresAt("7d", now)).toBe("2026-07-07T12:00:00.000Z");
    expect(getExpiresAt("30d", now)).toBe("2026-07-30T12:00:00.000Z");
  });

  it("marks expired, deleted, first-read, and exhausted shares unavailable", () => {
    expect(
      getUnavailableShareMessage(
        createShare({ expiresAt: "2026-06-30T11:59:59.000Z" }),
        now,
      ),
    ).toBe("Share has expired.");

    expect(
      getUnavailableShareMessage(createShare({ deletedAt: now.toISOString() })),
    ).toBe("Share was deleted.");

    expect(
      getUnavailableShareMessage(
        createShare({ deleteAfterRead: true, readAt: now.toISOString() }),
      ),
    ).toBe("Share was deleted after its first view.");

    expect(
      getUnavailableShareMessage(createShare({ maxViews: 2, currentViews: 2 })),
    ).toBe("Share view limit reached.");
  });

  it("soft-deletes shares after their final allowed view", () => {
    expect(
      getShareViewUpdate(
        createShare({ deleteAfterRead: true, currentViews: 0 }),
        now,
      ),
    ).toEqual({
      currentViews: 1,
      readAt: now.toISOString(),
      deletedAt: now.toISOString(),
    });

    expect(
      getShareViewUpdate(createShare({ maxViews: 2, currentViews: 1 }), now),
    ).toEqual({
      currentViews: 2,
      readAt: now.toISOString(),
      deletedAt: now.toISOString(),
    });
  });
});
