import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ShareQrCode, generateShareQrSvg } from "./share-qr-code";

describe("generateShareQrSvg", () => {
  it("returns an SVG string for a valid URL", async () => {
    const svg = await generateShareQrSvg("https://specdrop.app/s/abc123");

    expect(svg).toMatch(/^<svg/);
    expect(svg).toContain("</svg>");
  });

  it("returns an empty string for an empty URL", async () => {
    const svg = await generateShareQrSvg("");

    expect(svg).toBe("");
  });

  it("returns an empty string for a whitespace-only URL", async () => {
    const svg = await generateShareQrSvg("   ");

    expect(svg).toBe("");
  });

  it("returns an empty string for a non-URL string", async () => {
    const svg = await generateShareQrSvg("not-a-url");

    expect(svg).toBe("");
  });

  it("handles URLs with query parameters and hash fragments", async () => {
    const svg = await generateShareQrSvg(
      "https://specdrop.app/s/abc123?ref=demo#intro",
    );

    expect(svg).toMatch(/^<svg/);
  });
});

describe("ShareQrCode", () => {
  it("creates a React element without throwing", () => {
    const element = createElement(ShareQrCode, {
      url: "https://specdrop.app/s/abc123",
    });

    expect(element.type).toBe(ShareQrCode);
    expect(element.props.url).toBe("https://specdrop.app/s/abc123");
  });

  it("accepts an optional className prop", () => {
    const element = createElement(ShareQrCode, {
      className: "my-qr",
      url: "https://specdrop.app/s/abc123",
    });

    expect(element.props.className).toBe("my-qr");
  });

  it("creates an element with an empty URL without throwing", () => {
    const element = createElement(ShareQrCode, { url: "" });

    expect(element.type).toBe(ShareQrCode);
  });
});
