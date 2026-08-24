import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
import { ShareQrCode } from "~/components/share-qr-code";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { buildMarkdownFileUrl } from "~/features/shares/share-links";

export function ShareResult({
  copyStatus,
  error,
  handleCopy,
  handleDeleteShare,
  handleNewMarkdown,
  isDeleting,
  shareUrl,
  title,
}: {
  copyStatus: string;
  error: string;
  handleCopy: () => Promise<void>;
  handleDeleteShare: () => Promise<void>;
  handleNewMarkdown: () => void;
  isDeleting: boolean;
  shareUrl: string;
  title: string;
}) {
  const markdownUrl = buildMarkdownFileUrl(shareUrl);

  return (
    <section className="rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-4 text-[#d1e4fa] shadow-[inset_0_1px_1px_rgba(199,211,234,0.12),inset_0_24px_48px_rgba(199,211,234,0.05),0_24px_32px_rgba(6,6,14,0.7)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[13rem_1fr] lg:items-center">
        <div className="flex aspect-square items-center justify-center p-1">
          <ShareQrCode url={shareUrl} />
        </div>

        <div className="min-w-0">
          <p className="mb-3 inline-flex items-center gap-2 font-medium text-sm text-white">
            <CheckIcon aria-hidden="true" className="size-4 text-[#a78bfa]" />
            Share URL generated
          </p>
          <h2 className="truncate font-medium text-2xl text-white">
            {title || "Untitled Markdown"}
          </h2>
          <Input
            className="mt-4 h-10 min-w-0 border-[rgba(216,236,248,0.22)] bg-[#05060f] text-white"
            readOnly
            value={shareUrl}
          />
          {markdownUrl ? (
            <Input
              aria-label="Raw Markdown URL"
              className="mt-2 h-10 min-w-0 border-[rgba(216,236,248,0.18)] bg-[#05060f] text-[#d1e4fa]"
              readOnly
              value={markdownUrl}
            />
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-10 bg-[#663af3] px-4 text-white hover:bg-[#5930db]"
              onClick={handleCopy}
              type="button"
            >
              <CopyIcon aria-hidden="true" data-icon="inline-start" />
              {copyStatus || "Quick copy"}
            </Button>
            {markdownUrl ? (
              <Button
                asChild
                className="h-10 border-[rgba(216,236,248,0.2)] bg-[#070914] text-[#d1e4fa] hover:bg-[#101328] hover:text-white"
                variant="outline"
              >
                <a href={markdownUrl}>
                  <FileTextIcon aria-hidden="true" data-icon="inline-start" />
                  Raw .md
                </a>
              </Button>
            ) : null}
            <Button
              asChild
              className="h-10 border-[rgba(216,236,248,0.2)] bg-[#070914] text-[#d1e4fa] hover:bg-[#101328] hover:text-white"
              variant="outline"
            >
              <a href={shareUrl}>
                <ExternalLinkIcon aria-hidden="true" data-icon="inline-start" />
                Open
              </a>
            </Button>
            <Button
              className="h-10 border-[rgba(216,236,248,0.2)] bg-[#070914] text-[#d1e4fa] hover:bg-[#101328] hover:text-white"
              onClick={handleNewMarkdown}
              type="button"
              variant="outline"
            >
              <PlusIcon aria-hidden="true" data-icon="inline-start" />
              New
            </Button>
            <Button
              className="h-10 bg-red-500/10 text-red-200 hover:bg-red-500/20"
              disabled={isDeleting}
              onClick={handleDeleteShare}
              type="button"
              variant="destructive"
            >
              <Trash2Icon aria-hidden="true" data-icon="inline-start" />
              {isDeleting ? "..." : "Delete"}
            </Button>
          </div>

          {error ? (
            <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-red-200 text-sm">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
