import type { BytemdPlugin } from "bytemd";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";

type RehypeProcessor = Parameters<NonNullable<BytemdPlugin["rehype"]>>[0];
type MarkdownNode = {
  children?: MarkdownNode[];
  properties?: {
    href?: unknown;
    id?: string;
    rel?: string[];
    target?: string;
  };
  tagName?: string;
  type?: string;
  value?: unknown;
};

export function anchorHeadersPlugin(options: { prefix: string }): BytemdPlugin {
  return {
    rehype: (processor: RehypeProcessor) =>
      processor.use(() => rehypeSlug(options)),
  };
}

export function externalLinksPlugin(): BytemdPlugin {
  function createRel(element: unknown) {
    const rel: string[] = [];
    const node = element as MarkdownNode;

    if (node.properties?.href) {
      rel.push("nofollow");
    }

    if (node.properties?.target === "_blank") {
      rel.push("noopener");
    }

    return rel;
  }

  return {
    rehype: (processor: RehypeProcessor) =>
      processor.use(() => rehypeExternalLinks({ rel: createRel })),
  };
}

export function removeDuplicateClobberPrefix({
  clobberPrefix,
}: {
  clobberPrefix: string;
}): BytemdPlugin {
  function process(node: MarkdownNode) {
    if (node.properties?.id) {
      node.properties.id = node.properties.id.replace(
        new RegExp(`^(${clobberPrefix}){2,}`),
        clobberPrefix,
      );
    }

    for (const child of node.children ?? []) {
      process(child);
    }
  }

  return {
    rehype: (processor: RehypeProcessor) =>
      processor.use(() => (tree: MarkdownNode) => process(tree)),
  };
}

export function rewriteInternalHeadingLinks({
  clobberPrefix,
}: {
  clobberPrefix: string;
}): BytemdPlugin {
  function normalizeText(value: string) {
    return value.trim().replace(/\s+/g, " ").toLowerCase();
  }

  function textContent(node: MarkdownNode): string {
    if (typeof node.value === "string") {
      return node.value;
    }

    return (node.children ?? []).map(textContent).join("");
  }

  function isHeading(node: MarkdownNode) {
    return /^h[1-6]$/.test(node.tagName ?? "");
  }

  function collectTargets(
    node: MarkdownNode,
    ids: Set<string>,
    headingTextTargets: Map<string, string>,
  ) {
    if (node.properties?.id) {
      ids.add(node.properties.id);

      if (isHeading(node)) {
        const headingText = normalizeText(textContent(node));

        if (headingText && !headingTextTargets.has(headingText)) {
          headingTextTargets.set(headingText, node.properties.id);
        }
      }
    }

    for (const child of node.children ?? []) {
      collectTargets(child, ids, headingTextTargets);
    }
  }

  function rewriteLinks(
    node: MarkdownNode,
    ids: Set<string>,
    headingTextTargets: Map<string, string>,
  ) {
    const href = node.properties?.href;

    if (typeof href === "string" && href.startsWith("#")) {
      const target = href.slice(1);
      const prefixedTarget = `${clobberPrefix}${target}`;
      const linkTextTarget = headingTextTargets.get(
        normalizeText(textContent(node)),
      );

      if (node.properties && !target.startsWith(clobberPrefix)) {
        if (ids.has(prefixedTarget)) {
          node.properties.href = `#${prefixedTarget}`;
        } else if (linkTextTarget) {
          node.properties.href = `#${linkTextTarget}`;
        }
      }
    }

    for (const child of node.children ?? []) {
      rewriteLinks(child, ids, headingTextTargets);
    }
  }

  return {
    rehype: (processor: RehypeProcessor) =>
      processor.use(() => (tree: MarkdownNode) => {
        const ids = new Set<string>();
        const headingTextTargets = new Map<string, string>();

        collectTargets(tree, ids, headingTextTargets);
        rewriteLinks(tree, ids, headingTextTargets);
      }),
  };
}
