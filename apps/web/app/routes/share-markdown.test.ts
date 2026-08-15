import { readShareBySlug } from "@specdrop/api";
import type { RouterContextProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loader } from "./share-markdown";

vi.mock("@specdrop/api", () => ({
  readShareBySlug: vi.fn(),
}));

const readShareBySlugMock = vi.mocked(readShareBySlug);

describe("share Markdown loader", () => {
  beforeEach(() => {
    readShareBySlugMock.mockReset();
  });

  it("serves raw Markdown as plain UTF-8 text for AI clients", async () => {
    readShareBySlugMock.mockResolvedValue({
      share: {
        content: "# API Auth\n\nReview this spec.",
        createdAt: "2026-08-14T00:00:00.000Z",
        currentViews: 0,
        deleteAfterRead: false,
        expiresAt: null,
        maxViews: null,
        slug: "abc123",
        title: "API Auth",
      },
      status: "ready",
    });

    const response = await loader({
      context: {
        get: () => ({}),
      } as unknown as RouterContextProvider,
      params: {
        slug: "abc123",
      },
    });

    expect(response.headers.get("content-type")).toBe(
      "text/plain; charset=utf-8",
    );
    expect(response.headers.get("content-disposition")).toBe(
      'inline; filename="api-auth.md"',
    );
    await expect(response.text()).resolves.toBe(
      "# API Auth\n\nReview this spec.",
    );
  });
});
