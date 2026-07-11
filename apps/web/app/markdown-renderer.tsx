import type { ViewerProps } from "bytemd";
import type { ComponentType } from "react";
import { memo, useEffect, useState } from "react";
import "bytemd/dist/index.css";
import type { MarkdownOutlineItem } from "./markdown-plugins";

type SanitizeSchema = Parameters<NonNullable<ViewerProps["sanitize"]>>[0];
type MarkdownViewer = ComponentType<ViewerProps>;
type RendererState = {
  Viewer: MarkdownViewer;
  plugins: NonNullable<ViewerProps["plugins"]>;
};

const clobberPrefix = "specdrop-content-";

function sanitize(defaultSchema: SanitizeSchema): SanitizeSchema {
  const attributes = defaultSchema.attributes;

  if (!attributes) return defaultSchema;

  const globalAttributes = attributes["*"] ?? [];

  attributes["*"] = globalAttributes.filter((attribute) => {
    const name = Array.isArray(attribute) ? attribute[0] : attribute;

    return name !== "className" && name !== "target";
  });

  attributes["*"].push([
    "className",
    /^hljs|^language-|^bytemd-mermaid$|^math/,
  ]);

  return defaultSchema;
}

function MarkdownRendererComponent({
  content,
  onOutlineChange,
}: {
  content: string;
  onOutlineChange?: (outline: MarkdownOutlineItem[]) => void;
}) {
  const [renderer, setRenderer] = useState<RendererState | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadRenderer() {
      const [
        { Viewer },
        { default: breaks },
        { default: gemoji },
        { default: gfm },
        { default: highlight },
        { default: math },
        { default: mermaid },
        {
          anchorHeadersPlugin,
          externalLinksPlugin,
          mermaidControlsPlugin,
          removeDuplicateClobberPrefix,
          renderedHeadingOutlinePlugin,
          rewriteInternalHeadingLinks,
        },
      ] = await Promise.all([
        import("@bytemd/react"),
        import("@bytemd/plugin-breaks"),
        import("@bytemd/plugin-gemoji"),
        import("@bytemd/plugin-gfm"),
        import("@bytemd/plugin-highlight-ssr"),
        import("@bytemd/plugin-math"),
        import("@bytemd/plugin-mermaid"),
        import("./markdown-plugins"),
      ]);
      const mermaidTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "default";

      if (isCurrent) {
        setRenderer({
          Viewer,
          plugins: [
            gfm(),
            highlight(),
            math({ katexOptions: { output: "html" } }),
            breaks(),
            gemoji(),
            mermaid({ theme: mermaidTheme }),
            mermaidControlsPlugin(),
            ...(onOutlineChange
              ? [renderedHeadingOutlinePlugin({ onChange: onOutlineChange })]
              : []),
            anchorHeadersPlugin({ prefix: clobberPrefix }),
            removeDuplicateClobberPrefix({ clobberPrefix }),
            rewriteInternalHeadingLinks({ clobberPrefix }),
            externalLinksPlugin(),
          ],
        });
      }
    }

    void loadRenderer();

    return () => {
      isCurrent = false;
    };
  }, [onOutlineChange]);

  if (!renderer) {
    return (
      <article className="text-slate-600 dark:text-slate-300">
        Rendering Markdown...
      </article>
    );
  }

  const { Viewer, plugins } = renderer;

  return (
    <article className="specdrop-markdown">
      <Viewer
        plugins={plugins}
        remarkRehype={{
          clobberPrefix,
          footnoteBackLabel: "Back to content",
          footnoteLabel: "Footnotes",
        }}
        sanitize={sanitize}
        value={content}
      />
    </article>
  );
}

export const MarkdownRenderer = memo(MarkdownRendererComponent);
