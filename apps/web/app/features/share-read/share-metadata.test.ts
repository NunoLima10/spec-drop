import { describe, expect, it } from "vitest";
import { estimateReadingTime } from "./share-metadata";

describe("share metadata", () => {
  it("estimates reading time from readable Markdown text", () => {
    const estimate = estimateReadingTime("# Title\n\nOne two three.");

    expect(estimate).toEqual({
      minutes: 1,
      text: "1 min read",
      words: 4,
    });
  });
});
