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
type MermaidControlIcon =
  | "collapse"
  | "expand"
  | "reset"
  | "zoomIn"
  | "zoomOut";

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
  const minScale = 0.5;
  const maxScale = 4;
  const svgNamespace = "http://www.w3.org/2000/svg";

  function clampScale(scale: number) {
    return Math.min(maxScale, Math.max(minScale, scale));
  }

  function getPointerDistance(
    firstPointer: PointerEvent,
    secondPointer: PointerEvent,
  ) {
    return Math.hypot(
      secondPointer.clientX - firstPointer.clientX,
      secondPointer.clientY - firstPointer.clientY,
    );
  }

  function getPointerMidpoint(
    firstPointer: PointerEvent,
    secondPointer: PointerEvent,
  ) {
    return {
      x: (firstPointer.clientX + secondPointer.clientX) / 2,
      y: (firstPointer.clientY + secondPointer.clientY) / 2,
    };
  }

  function createSvgElement<K extends keyof SVGElementTagNameMap>(
    tagName: K,
    attributes: Record<string, string>,
  ) {
    const element = document.createElementNS(svgNamespace, tagName);

    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }

    return element;
  }

  function appendSvgChild(
    svg: SVGSVGElement,
    tagName: "circle" | "line" | "path" | "polyline",
    attributes: Record<string, string>,
  ) {
    svg.appendChild(createSvgElement(tagName, attributes));
  }

  function createIcon(icon: MermaidControlIcon) {
    const svg = createSvgElement("svg", {
      "aria-hidden": "true",
      class: "specdrop-mermaid-icon",
      fill: "none",
      height: "16",
      stroke: "currentColor",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "stroke-width": "2",
      viewBox: "0 0 24 24",
      width: "16",
    });

    if (icon === "expand") {
      appendSvgChild(svg, "polyline", { points: "15 3 21 3 21 9" });
      appendSvgChild(svg, "polyline", { points: "9 21 3 21 3 15" });
      appendSvgChild(svg, "line", { x1: "21", x2: "14", y1: "3", y2: "10" });
      appendSvgChild(svg, "line", { x1: "3", x2: "10", y1: "21", y2: "14" });
    } else if (icon === "collapse") {
      appendSvgChild(svg, "polyline", { points: "4 14 10 14 10 20" });
      appendSvgChild(svg, "polyline", { points: "20 10 14 10 14 4" });
      appendSvgChild(svg, "line", { x1: "20", x2: "14", y1: "4", y2: "10" });
      appendSvgChild(svg, "line", { x1: "4", x2: "10", y1: "20", y2: "14" });
    } else if (icon === "reset") {
      appendSvgChild(svg, "path", {
        d: "M3 12a9 9 0 1 0 9-9 9.8 9.8 0 0 0-6.7 2.6",
      });
      appendSvgChild(svg, "polyline", { points: "3 3 3 9 9 9" });
    } else {
      appendSvgChild(svg, "circle", { cx: "11", cy: "11", r: "8" });
      appendSvgChild(svg, "line", {
        x1: "21",
        x2: "16.65",
        y1: "21",
        y2: "16.65",
      });
      appendSvgChild(svg, "line", { x1: "8", x2: "14", y1: "11", y2: "11" });

      if (icon === "zoomIn") {
        appendSvgChild(svg, "line", { x1: "11", x2: "11", y1: "8", y2: "14" });
      }
    }

    return svg;
  }

  function setButtonIcon(button: HTMLButtonElement, icon: MermaidControlIcon) {
    button.replaceChildren(createIcon(icon));
  }

  function enhance(container: HTMLElement) {
    const existingToolbar = container.querySelector(
      ":scope > .specdrop-mermaid-toolbar",
    );
    const existingViewport = container.querySelector(
      ":scope > .specdrop-mermaid-viewport",
    );

    if (
      container.dataset.specdropMermaidEnhanced === "true" &&
      existingToolbar &&
      existingViewport
    ) {
      return;
    }

    existingToolbar?.remove();

    if (existingViewport) {
      const existingCanvas = existingViewport.querySelector(
        ":scope > .specdrop-mermaid-canvas",
      );
      const source = existingCanvas ?? existingViewport;

      while (source.firstChild) {
        container.appendChild(source.firstChild);
      }

      existingViewport.remove();
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
    const activePointers = new Map<number, PointerEvent>();
    let gestureStart:
      | {
          distance: number;
          midpointX: number;
          midpointY: number;
          offsetX: number;
          offsetY: number;
          scale: number;
        }
      | undefined;

    function updateTransform() {
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }

    function setScale(nextScale: number) {
      scale = clampScale(nextScale);
      updateTransform();
    }

    function syncFullscreenButton() {
      const isFullscreen =
        document.fullscreenElement === container ||
        container.classList.contains("is-fullscreen");

      fullscreenButton.setAttribute(
        "aria-label",
        isFullscreen
          ? "Exit full screen Mermaid diagram"
          : "Open Mermaid diagram full screen",
      );
      fullscreenButton.title = isFullscreen
        ? "Exit full screen"
        : "Open full screen";
      setButtonIcon(fullscreenButton, isFullscreen ? "collapse" : "expand");
      document.documentElement.classList.toggle(
        "specdrop-mermaid-fullscreen-open",
        container.classList.contains("is-fullscreen"),
      );
    }

    function handleFullscreenChange() {
      if (
        document.fullscreenElement !== container &&
        container.classList.contains("is-fullscreen")
      ) {
        container.classList.remove("is-fullscreen");
      }

      syncFullscreenButton();
    }

    function closeFullscreen() {
      container.classList.remove("is-fullscreen");

      if (document.fullscreenElement === container) {
        void document.exitFullscreen();
      }

      syncFullscreenButton();
    }

    function handleKeydown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        container.classList.contains("is-fullscreen")
      ) {
        closeFullscreen();
      }
    }

    function createButton(
      label: string,
      title: string,
      icon: MermaidControlIcon,
      onClick: () => void,
    ) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "specdrop-mermaid-button";
      button.setAttribute("aria-label", label);
      button.title = title;
      setButtonIcon(button, icon);
      button.addEventListener("click", onClick);

      return button;
    }

    const fullscreenButton = createButton(
      "Open Mermaid diagram full screen",
      "Open full screen",
      "expand",
      () => {
        if (
          document.fullscreenElement === container ||
          container.classList.contains("is-fullscreen")
        ) {
          closeFullscreen();
          return;
        }

        container.classList.add("is-fullscreen");
        syncFullscreenButton();

        if (document.fullscreenEnabled) {
          void container.requestFullscreen().catch(() => {
            syncFullscreenButton();
          });
        }
      },
    );

    toolbar.appendChild(fullscreenButton);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("keydown", handleKeydown);

    toolbar.appendChild(
      createButton("Zoom out Mermaid diagram", "Zoom out", "zoomOut", () =>
        setScale(scale - 0.2),
      ),
    );
    toolbar.appendChild(
      createButton("Reset Mermaid diagram view", "Reset view", "reset", () => {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        updateTransform();
      }),
    );
    toolbar.appendChild(
      createButton("Zoom in Mermaid diagram", "Zoom in", "zoomIn", () =>
        setScale(scale + 0.2),
      ),
    );

    function getViewportPoint(clientX: number, clientY: number) {
      const viewportBounds = viewport.getBoundingClientRect();

      return {
        x: clientX - viewportBounds.left - viewport.clientLeft,
        y: clientY - viewportBounds.top - viewport.clientTop,
      };
    }

    function startGesture() {
      const pointers = Array.from(activePointers.values());

      if (pointers.length === 1) {
        const firstPointer = pointers[0];

        if (!firstPointer) {
          return;
        }

        gestureStart = {
          distance: 0,
          midpointX: firstPointer.clientX,
          midpointY: firstPointer.clientY,
          offsetX,
          offsetY,
          scale,
        };
        return;
      }

      if (pointers.length >= 2) {
        const [firstPointer, secondPointer] = pointers;

        if (!firstPointer || !secondPointer) {
          return;
        }

        const midpoint = getPointerMidpoint(firstPointer, secondPointer);

        gestureStart = {
          distance: getPointerDistance(firstPointer, secondPointer),
          midpointX: midpoint.x,
          midpointY: midpoint.y,
          offsetX,
          offsetY,
          scale,
        };
      }
    }

    viewport.addEventListener("pointerdown", (event) => {
      activePointers.set(event.pointerId, event);
      startGesture();
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add("is-panning");
    });

    viewport.addEventListener("pointermove", (event) => {
      if (!activePointers.has(event.pointerId) || !gestureStart) {
        return;
      }

      activePointers.set(event.pointerId, event);

      const pointers = Array.from(activePointers.values());

      if (pointers.length === 1) {
        offsetX = gestureStart.offsetX + event.clientX - gestureStart.midpointX;
        offsetY = gestureStart.offsetY + event.clientY - gestureStart.midpointY;
      } else if (pointers.length >= 2 && gestureStart.distance > 0) {
        const [firstPointer, secondPointer] = pointers;

        if (!firstPointer || !secondPointer) {
          return;
        }

        const midpoint = getPointerMidpoint(firstPointer, secondPointer);
        const midpointStart = getViewportPoint(
          gestureStart.midpointX,
          gestureStart.midpointY,
        );
        const midpointNow = getViewportPoint(midpoint.x, midpoint.y);
        const contentX =
          (midpointStart.x - gestureStart.offsetX) / gestureStart.scale;
        const contentY =
          (midpointStart.y - gestureStart.offsetY) / gestureStart.scale;

        scale = clampScale(
          gestureStart.scale *
            (getPointerDistance(firstPointer, secondPointer) /
              gestureStart.distance),
        );
        offsetX = midpointNow.x - contentX * scale;
        offsetY = midpointNow.y - contentY * scale;
      }

      updateTransform();
    });

    function stopPanning(event: PointerEvent) {
      if (!activePointers.has(event.pointerId)) {
        return;
      }

      activePointers.delete(event.pointerId);
      if (viewport.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }

      if (activePointers.size === 0) {
        gestureStart = undefined;
        viewport.classList.remove("is-panning");
      } else {
        startGesture();
      }
    }

    viewport.addEventListener("pointerup", stopPanning);
    viewport.addEventListener("pointercancel", stopPanning);

    viewport.appendChild(canvas);
    container.appendChild(toolbar);
    container.appendChild(viewport);
    updateTransform();

    return () => {
      if (container.classList.contains("is-fullscreen")) {
        closeFullscreen();
      }

      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("keydown", handleKeydown);
    };
  }

  function enhanceAll(markdownBody: HTMLElement) {
    const cleanups: Array<() => void> = [];

    markdownBody
      .querySelectorAll<HTMLElement>(".bytemd-mermaid")
      .forEach((container) => {
        const cleanup = enhance(container);

        if (cleanup) {
          cleanups.push(cleanup);
        }
      });

    return cleanups;
  }

  return {
    viewerEffect({ markdownBody }) {
      const cleanups = enhanceAll(markdownBody);

      const observer = new MutationObserver(() => {
        cleanups.push(...enhanceAll(markdownBody));
      });
      observer.observe(markdownBody, { childList: true, subtree: true });

      return () => {
        observer.disconnect();

        for (const cleanup of cleanups) {
          cleanup();
        }
      };
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
