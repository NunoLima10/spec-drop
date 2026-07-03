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

export type MarkdownOutlineItem = {
  depth: number;
  id: string;
  text: string;
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

export function collectRenderedHeadings(
  markdownBody: HTMLElement,
): MarkdownOutlineItem[] {
  return Array.from(
    markdownBody.querySelectorAll<HTMLHeadingElement>("h1[id], h2[id], h3[id]"),
    (heading) => ({
      depth: Number(heading.tagName.slice(1)),
      id: heading.id,
      text: heading.textContent?.replace(/\s+/g, " ").trim() ?? "",
    }),
  ).filter((heading) => heading.text);
}

export function renderedHeadingOutlinePlugin({
  onChange,
}: {
  onChange: (outline: MarkdownOutlineItem[]) => void;
}): BytemdPlugin {
  return {
    viewerEffect({ markdownBody }) {
      const emitOutline = () => onChange(collectRenderedHeadings(markdownBody));

      emitOutline();

      const observer = new MutationObserver(emitOutline);
      observer.observe(markdownBody, { childList: true, subtree: true });

      return () => observer.disconnect();
    },
  };
}

export function mermaidControlsPlugin(): BytemdPlugin {
  function enhance(container: HTMLElement) {
    if (container.dataset.specdropMermaidEnhanced === "true") {
      return;
    }

    const svg = container.querySelector("svg");

    if (!svg) {
      return;
    }

    container.dataset.specdropMermaidEnhanced = "true";
    container.classList.add("specdrop-mermaid");

    const toolbar = document.createElement("div");
    toolbar.className = "specdrop-mermaid-toolbar";
    toolbar.setAttribute("aria-label", "Mermaid diagram controls");

    const viewport = document.createElement("div");
    viewport.className = "specdrop-mermaid-viewport";
    viewport.tabIndex = 0;

    const canvas = document.createElement("div");
    canvas.className = "specdrop-mermaid-canvas";

    while (container.firstChild) {
      canvas.appendChild(container.firstChild);
    }

    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;
    let activePointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startOffsetX = 0;
    let startOffsetY = 0;

    function updateTransform() {
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    function setScale(nextScale: number) {
      scale = Math.min(3, Math.max(0.5, nextScale));
      updateTransform();
    }

    function createButton(label: string, text: string, onClick: () => void) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "specdrop-mermaid-button";
      button.setAttribute("aria-label", label);
      button.textContent = text;
      button.addEventListener("click", onClick);

      return button;
    }

    toolbar.appendChild(
      createButton("Zoom out Mermaid diagram", "-", () =>
        setScale(scale - 0.2),
      ),
    );
    toolbar.appendChild(
      createButton("Reset Mermaid diagram view", "Reset", () => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        updateTransform();
      }),
    );
    toolbar.appendChild(
      createButton("Zoom in Mermaid diagram", "+", () => setScale(scale + 0.2)),
    );

    viewport.addEventListener("pointerdown", (event) => {
      activePointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startOffsetX = offsetX;
      startOffsetY = offsetY;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-panning");
    });

    viewport.addEventListener("pointermove", (event) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      offsetX = startOffsetX + event.clientX - startX;
      offsetY = startOffsetY + event.clientY - startY;
      updateTransform();
    });

    function stopPanning(event: PointerEvent) {
      if (activePointerId !== event.pointerId) {
        return;
      }

      activePointerId = null;
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
      viewport.classList.remove("is-panning");
    }

    viewport.addEventListener("pointerup", stopPanning);
    viewport.addEventListener("pointercancel", stopPanning);

    viewport.appendChild(canvas);
    container.appendChild(toolbar);
    container.appendChild(viewport);
    updateTransform();
  }

  function enhanceAll(markdownBody: HTMLElement) {
    markdownBody
      .querySelectorAll<HTMLElement>(".bytemd-mermaid")
      .forEach(enhance);
  }

  return {
    viewerEffect({ markdownBody }) {
      enhanceAll(markdownBody);

      const observer = new MutationObserver(() => enhanceAll(markdownBody));
      observer.observe(markdownBody, { childList: true, subtree: true });

      return () => observer.disconnect();
    },
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
