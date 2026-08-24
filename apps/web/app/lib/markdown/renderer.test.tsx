import type { BytemdPlugin } from "bytemd";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { rewriteInternalHeadingLinks } from "./plugins";
import { MarkdownRenderer } from "./renderer";

type RehypeProcessor = Parameters<NonNullable<BytemdPlugin["rehype"]>>[0];
type TestNode = {
  children?: TestNode[];
  properties?: {
    href?: string;
    id?: string;
  };
  tagName?: string;
  type?: string;
  value?: string;
};
type Transformer = (tree: TestNode) => void;

function applyRehypePlugin(plugin: BytemdPlugin, tree: TestNode) {
  let transformer: Transformer | undefined;
  const processor = {
    use(createTransformer: () => Transformer) {
      transformer = createTransformer();
      return processor;
    },
  };

  plugin.rehype?.(processor as unknown as RehypeProcessor);
  transformer?.(tree);
}

describe("MarkdownRenderer", () => {
  it("creates the ByteMD viewer wrapper", () => {
    const element = createElement(MarkdownRenderer, {
      content: "# Title\n\n**On-dark**",
    });

    expect(element.type).toBe(MarkdownRenderer);
  });
});

describe("rewriteInternalHeadingLinks", () => {
  it("rewrites short table-of-contents anchors by matching heading text", () => {
    const tree: TestNode = {
      children: [
        {
          children: [{ type: "text", value: "Block Elements" }],
          properties: { href: "#block" },
          tagName: "a",
        },
        {
          children: [{ type: "text", value: "Block Elements" }],
          properties: { id: "specdrop-content-block-elements" },
          tagName: "h2",
        },
      ],
    };

    applyRehypePlugin(
      rewriteInternalHeadingLinks({ clobberPrefix: "specdrop-content-" }),
      tree,
    );

    expect(tree.children?.[0]?.properties?.href).toBe(
      "#specdrop-content-block-elements",
    );
  });
});
