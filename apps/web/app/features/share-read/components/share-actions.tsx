import {
  CheckIcon,
  Code2Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  QrCodeIcon,
} from "lucide-react";
import { useState } from "react";
import { ShareQrCode } from "~/components/share-qr-code";
import { Button } from "~/components/ui/button";
import { buildAiReviewPrompt } from "../ai-open-links";
import type { PreviewMode } from "../types";
import { AiOpenMenu } from "./ai-open-menu";

export function ShareActions({
  content,
  copyStatus,
  mode,
  onCopyMarkdown,
  onDownloadMarkdown,
  setMode,
  markdownUrl,
  shareUrl,
  title,
}: {
  content: string;
  copyStatus: string;
  mode: PreviewMode;
  onCopyMarkdown: () => Promise<void>;
  onDownloadMarkdown: () => void;
  setMode: (mode: PreviewMode) => void;
  markdownUrl: string;
  shareUrl: string;
  title: string;
}) {
  const [isQrOpen, setIsQrOpen] = useState(false);
  const aiReviewPrompt = buildAiReviewPrompt({
    content,
    markdownUrl,
    shareUrl,
    title,
  });

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#05060f]/70 p-1">
          <Button
            className={`h-8 rounded-md px-3 ${
              mode === "render"
                ? "bg-white/15 text-white hover:bg-white/20"
                : "bg-transparent text-[#9da7ba] hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setMode("render")}
            size="sm"
            type="button"
          >
            <EyeIcon aria-hidden="true" data-icon="inline-start" />
            Render
          </Button>
          <Button
            className={`h-8 rounded-md px-3 ${
              mode === "code"
                ? "bg-white/15 text-white hover:bg-white/20"
                : "bg-transparent text-[#9da7ba] hover:bg-white/10 hover:text-white"
            }`}
            onClick={() => setMode("code")}
            size="sm"
            type="button"
          >
            <Code2Icon aria-hidden="true" data-icon="inline-start" />
            Code
          </Button>
        </div>
        <Button
          aria-label={copyStatus || "Copy Markdown"}
          className="h-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 px-3 text-[#d1e4fa] hover:bg-white/10 hover:text-white"
          onClick={() => void onCopyMarkdown()}
          size="sm"
          title={copyStatus || "Copy Page"}
          type="button"
          variant="outline"
        >
          {copyStatus ? (
            <CheckIcon aria-hidden="true" className="size-4" />
          ) : (
            <CopyIcon aria-hidden="true" className="size-4" />
          )}
          {copyStatus || "Copy Page"}
        </Button>
        <AiOpenMenu prompt={aiReviewPrompt} />
        {markdownUrl ? (
          <Button
            asChild
            className="h-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 px-3 text-[#d1e4fa] hover:bg-white/10 hover:text-white"
            size="sm"
            title="Open raw Markdown"
            variant="outline"
          >
            <a href={markdownUrl} rel="noopener noreferrer" target="_blank">
              <FileTextIcon aria-hidden="true" data-icon="inline-start" />
              Raw .md
            </a>
          </Button>
        ) : null}
        <Button
          aria-label="Download Markdown"
          className="size-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 p-0 text-[#d1e4fa] hover:bg-white/10 hover:text-white"
          onClick={onDownloadMarkdown}
          size="sm"
          title="Download Markdown"
          type="button"
          variant="outline"
        >
          <DownloadIcon aria-hidden="true" className="size-4" />
        </Button>
        <Button
          aria-expanded={isQrOpen}
          aria-label={isQrOpen ? "Hide share QR code" : "Show share QR code"}
          className="size-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 p-0 text-[#d1e4fa] hover:bg-white/10 hover:text-white"
          disabled={!shareUrl}
          onClick={() => setIsQrOpen((isOpen) => !isOpen)}
          size="sm"
          title={isQrOpen ? "Hide QR code" : "Show QR code"}
          type="button"
          variant="outline"
        >
          <QrCodeIcon aria-hidden="true" className="size-4" />
        </Button>
      </div>

      {isQrOpen && shareUrl ? (
        <div className="mt-4 w-full max-w-44 rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#05060f]/80 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.28)]">
          <ShareQrCode className="p-2" url={shareUrl} />
          <p className="mt-3 break-all text-[#9da7ba] text-xs leading-5">
            {shareUrl}
          </p>
        </div>
      ) : null}
    </div>
  );
}
