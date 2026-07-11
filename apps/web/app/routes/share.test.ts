import { describe, expect, it } from "vitest";
import { getReadingProgress } from "./share";

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
