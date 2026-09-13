import { describe, expect, it } from "vitest";
import {
  ANALYTICS_EVENT_NAMES,
  isAllowedAnalyticsEvent,
} from "./product-analytics";

describe("analytics event allowlist", () => {
  it.each(ANALYTICS_EVENT_NAMES)("allows %s", (eventName) => {
    expect(isAllowedAnalyticsEvent(eventName)).toBe(true);
  });

  it.each([
    "$autocapture",
    "$exception",
    "$feature_flag_called",
    "identify",
  ])("rejects %s", (eventName) => {
    expect(isAllowedAnalyticsEvent(eventName)).toBe(false);
  });
});
