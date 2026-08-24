import { describe, expect, it } from "vitest";
import {
  buildCreateShareInput,
  getCreateShareClientError,
  parseMaxViewsInput,
} from "./share-form";

describe("share form contracts", () => {
  it("builds API create input with normalized optional fields", () => {
    expect(
      buildCreateShareInput({
        title: "  API Auth RFC  ",
        content: "# API Auth\n\nBody",
        expiresIn: "24h",
        deleteAfterRead: false,
        maxViews: " 12 ",
      }),
    ).toEqual({
      title: "API Auth RFC",
      content: "# API Auth\n\nBody",
      expiresIn: "24h",
      deleteAfterRead: false,
      maxViews: 12,
    });
  });

  it("omits blank title and max view fields", () => {
    expect(
      buildCreateShareInput({
        title: "  ",
        content: "# Untitled",
        expiresIn: "never",
        deleteAfterRead: true,
        maxViews: "",
      }),
    ).toEqual({
      title: undefined,
      content: "# Untitled",
      expiresIn: "never",
      deleteAfterRead: true,
      maxViews: undefined,
    });
  });

  it("validates max view input before sending the mutation", () => {
    expect(parseMaxViewsInput("10000")).toEqual({
      status: "ready",
      value: 10_000,
    });
    expect(parseMaxViewsInput("0")).toEqual({ status: "invalid" });
    expect(parseMaxViewsInput("1.5")).toEqual({ status: "invalid" });
    expect(parseMaxViewsInput("")).toEqual({ status: "empty" });
    expect(
      getCreateShareClientError({
        content: "# Title",
        maxViews: "10001",
      }),
    ).toBe("Max views must be a whole number from 1 to 10000.");
  });
});
