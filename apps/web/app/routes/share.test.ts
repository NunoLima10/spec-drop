import { describe, expect, it } from "vitest";
import { getReadingProgress } from "../reading-progress";
import { getSharePageTitle, meta } from "./share";

function getMetaContent(
  descriptors: ReturnType<typeof meta>,
  key: "name" | "property",
  value: string,
) {
  const descriptor = descriptors.find((item) => item[key] === value);

  if (!descriptor) {
    return undefined;
  }

  return "content" in descriptor ? descriptor.content : undefined;
}

function getTitle(descriptors: ReturnType<typeof meta>) {
  const descriptor = descriptors.find((item) => "title" in item);

  return descriptor && "title" in descriptor ? descriptor.title : undefined;
}

describe("getReadingProgress", () => {
  it("returns full progress when the document does not scroll", () => {
    expect(
      getReadingProgress({
        scrollHeight: 600,
        scrollY: 0,
        viewportHeight: 800,
      }),
    ).toBe(100);
  });

  it("calculates and clamps scroll progress", () => {
    expect(
      getReadingProgress({
        scrollHeight: 2000,
        scrollY: 600,
        viewportHeight: 800,
      }),
    ).toBe(50);

    expect(
      getReadingProgress({
        scrollHeight: 2000,
        scrollY: 1400,
        viewportHeight: 800,
      }),
    ).toBe(100);

    expect(
      getReadingProgress({
        scrollHeight: 2000,
        scrollY: -100,
        viewportHeight: 800,
      }),
    ).toBe(0);
  });
});

describe("share metadata", () => {
  it("uses the share title for page and social preview titles", () => {
    const descriptors = meta({
      data: {
        canonicalUrl: "https://specdrop.test/s/abc123",
        previewTitle: "API Authentication RFC",
      },
    });

    expect(getSharePageTitle("API Authentication RFC")).toBe(
      "API Authentication RFC | SpecsDrop",
    );
    expect(getTitle(descriptors)).toBe("API Authentication RFC | SpecsDrop");
    expect(getMetaContent(descriptors, "property", "og:title")).toBe(
      "API Authentication RFC | SpecsDrop",
    );
    expect(getMetaContent(descriptors, "name", "twitter:title")).toBe(
      "API Authentication RFC | SpecsDrop",
    );
    expect(getMetaContent(descriptors, "property", "og:url")).toBe(
      "https://specdrop.test/s/abc123",
    );
  });

  it("falls back to a generic title when a share has no title", () => {
    expect(getSharePageTitle(null)).toBe("Shared Markdown | SpecsDrop");
  });
});
