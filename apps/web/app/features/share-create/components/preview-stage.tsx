import { MarkdownRenderer } from "~/lib/markdown/renderer";
import type { PreviewMode } from "../types";
import { PreviewToggle } from "./preview-toggle";

export function PreviewStage({
  content,
  mode,
  setMode,
}: {
  content: string;
  mode: PreviewMode;
  setMode: (mode: PreviewMode) => void;
}) {
  return (
    <section className="mt-4 rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-4 text-[#d1e4fa] shadow-[inset_0_1px_1px_rgba(199,211,234,0.12),inset_0_24px_48px_rgba(199,211,234,0.05),0_24px_32px_rgba(6,6,14,0.7)]">
      <div className="mb-5 flex justify-end border-[rgba(216,236,248,0.12)] border-b pb-3">
        <PreviewToggle mode={mode} setMode={setMode} />
      </div>
      {mode === "code" ? (
        <MarkdownSourcePreview content={content} />
      ) : (
        <MarkdownRenderer content={content} />
      )}
    </section>
  );
}

function MarkdownSourcePreview({ content }: { content: string }) {
  return (
    <pre className="whitespace-pre-wrap break-words rounded-lg bg-[#05060f] p-4 font-mono text-[#d1e4fa] text-sm leading-6">
      <code>{content}</code>
    </pre>
  );
}
