import { describe, expect, it } from "vitest";
import { getPostHogPublicConfig } from "./posthog-config";

describe("getPostHogPublicConfig", () => {
  it("returns normalized configuration when both values exist", () => {
    expect(
      getPostHogPublicConfig("  phc_test  ", "  https://us.i.posthog.com  "),
    ).toEqual({
      host: "https://us.i.posthog.com",
      projectToken: "phc_test",
    });
  });

  it.each([
    [undefined, "https://us.i.posthog.com"],
    ["phc_test", undefined],
    ["", "https://us.i.posthog.com"],
    ["phc_test", "   "],
  ])("returns null when configuration is incomplete", (token, host) => {
    expect(getPostHogPublicConfig(token, host)).toBeNull();
  });
});
