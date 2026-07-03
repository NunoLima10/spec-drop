import {
  CheckIcon,
  ClockIcon,
  Code2Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  InfinityIcon,
  TimerIcon,
  Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { StatusPage } from "~/components/status-page";
import { Button } from "~/components/ui/button";
import type { MarkdownOutlineItem } from "../markdown-plugins";
import { MarkdownRenderer } from "../markdown-renderer";
import { estimateReadingTime } from "../share-metadata";
import { trpc } from "../trpc";

type PreviewMode = "render" | "code";

type ShareState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      share: {
        title: string | null;
        content: string;
        createdAt: string;
        expiresAt: string | null;
        deleteAfterRead: boolean;
        maxViews: number | null;
        currentViews: number;
      };
    };

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function updateProgress() {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(100);
        return;
      }

      setProgress(
        Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)),
      );
    }

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return progress;
}

export default function Share() {
  const { slug } = useParams();
  const [state, setState] = useState<ShareState>({ status: "loading" });
  const [outline, setOutline] = useState<MarkdownOutlineItem[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("render");
  const [copyStatus, setCopyStatus] = useState("");
  const readingProgress = useReadingProgress();
  const handleOutlineChange = useCallback((items: MarkdownOutlineItem[]) => {
    setOutline((currentItems) =>
      outlinesAreEqual(currentItems, items) ? currentItems : items,
    );
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function loadShare() {
      if (!slug) {
        setState({ status: "error", message: "Share not found." });
        return;
      }

      try {
        const share = await trpc.share.bySlug.query({ slug });

        if (isCurrent) {
          setState({ status: "ready", share });
        }
      } catch (error) {
        if (isCurrent) {
          setState({
            status: "error",
            message:
              error instanceof Error ? error.message : "Share not found.",
          });
        }
      }
    }

    loadShare();

    return () => {
      isCurrent = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!copyStatus) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyStatus("");
    }, 2000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copyStatus]);

  if (state.status === "loading") {
    return <ShareLoadingSkeleton />;
  }

  if (state.status === "error") {
    return (
      <StatusPage
        description={state.message}
        statusCode="404"
        title="This Markdown share is not available."
        variant="unavailable"
      />
    );
  }

  const { share } = state;
  const readingTime = estimateReadingTime(share.content);
  const title = share.title || "Untitled Markdown";

  async function handleCopyMarkdown() {
    const didCopy = await copyMarkdownToClipboard(share.content);
    setCopyStatus(didCopy ? "Copied" : "Copy failed");
  }

  function handleDownloadMarkdown() {
    const fileName = `${toMarkdownFileName(title)}.md`;
    const blob = new Blob([share.content], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-[#663af3]"
        style={{ width: `${readingProgress}%` }}
      />
      <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.45)_22deg,transparent_52deg)] blur-2xl" />

        <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <section className="min-w-0 max-w-3xl">
              <header className="mb-6 pb-4">
                <p className="mb-3 text-[#c7d3ea] text-sm uppercase tracking-normal">
                  Shared Markdown
                </p>
                <h1 className="bg-[linear-gradient(0deg,#d8ecf8_0%,#98c0ef_100%)] bg-clip-text font-medium text-4xl text-transparent leading-tight tracking-normal sm:text-[3rem]">
                  {title}
                </h1>
                <ShareMetadata
                  createdAt={share.createdAt}
                  currentViews={share.currentViews}
                  deleteAfterRead={share.deleteAfterRead}
                  expiresAt={share.expiresAt}
                  maxViews={share.maxViews}
                  readingTime={readingTime.text}
                />
                <ShareActions
                  copyStatus={copyStatus}
                  mode={previewMode}
                  onCopyMarkdown={handleCopyMarkdown}
                  onDownloadMarkdown={handleDownloadMarkdown}
                  setMode={setPreviewMode}
                />
              </header>

              {previewMode === "render" && outline.length ? (
                <details className="mb-8 border-[rgba(216,236,248,0.14)] border-t pt-3 lg:hidden">
                  <summary className="cursor-pointer font-medium text-[#d8ecf8]">
                    Contents
                  </summary>
                  <OutlineNav outline={outline} />
                </details>
              ) : null}

              {previewMode === "code" ? (
                <MarkdownSource content={share.content} />
              ) : (
                <div className="specdrop-reader">
                  <MarkdownRenderer
                    content={share.content}
                    onOutlineChange={handleOutlineChange}
                  />
                </div>
              )}
            </section>

            {previewMode === "render" && outline.length ? (
              <aside className="hidden lg:block">
                <div className="sticky top-10 border-[rgba(216,236,248,0.16)] border-l pl-5">
                  <p className="mb-3 font-medium text-[#d8ecf8] text-sm">
                    Contents
                  </p>
                  <OutlineNav outline={outline} />
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </main>
    </>
  );
}

function ShareActions({
  copyStatus,
  mode,
  onCopyMarkdown,
  onDownloadMarkdown,
  setMode,
}: {
  copyStatus: string;
  mode: PreviewMode;
  onCopyMarkdown: () => Promise<void>;
  onDownloadMarkdown: () => void;
  setMode: (mode: PreviewMode) => void;
}) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-2">
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
        className="size-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 p-0 text-[#d1e4fa] hover:bg-white/10 hover:text-white"
        onClick={() => void onCopyMarkdown()}
        size="sm"
        title={copyStatus || "Copy Markdown"}
        type="button"
        variant="outline"
      >
        {copyStatus ? (
          <CheckIcon aria-hidden="true" className="size-4" />
        ) : (
          <CopyIcon aria-hidden="true" className="size-4" />
        )}
      </Button>
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
    </div>
  );
}

function ShareMetadata({
  createdAt,
  currentViews,
  deleteAfterRead,
  expiresAt,
  maxViews,
  readingTime,
}: {
  createdAt: string;
  currentViews: number;
  deleteAfterRead: boolean;
  expiresAt: string | null;
  maxViews: number | null;
  readingTime: string;
}) {
  return (
    <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <MetadataItem
        icon={<ClockIcon aria-hidden="true" className="size-4" />}
        label="Created"
        value={new Date(createdAt).toLocaleString()}
      />
      <MetadataItem
        icon={<TimerIcon aria-hidden="true" className="size-4" />}
        label="Reading time"
        value={readingTime.replace(" read", "")}
      />
      <MetadataItem
        icon={<EyeIcon aria-hidden="true" className="size-4" />}
        label="Views"
        value={`${currentViews}`}
      />
      <MetadataItem
        icon={<InfinityIcon aria-hidden="true" className="size-4" />}
        label="Expires"
        value={expiresAt ? new Date(expiresAt).toLocaleString() : "Never"}
      />
      {maxViews ? (
        <MetadataItem
          icon={<EyeIcon aria-hidden="true" className="size-4" />}
          label="Max views"
          value={`${maxViews} max`}
        />
      ) : null}
      {deleteAfterRead ? (
        <MetadataItem
          icon={<Trash2Icon aria-hidden="true" className="size-4" />}
          label="Delete after read"
          value="Delete after read"
        />
      ) : null}
    </dl>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[#d8ecf8]">
      <dt className="sr-only">{label}</dt>
      <span className="text-[#9da7ba]">{icon}</span>
      <dd>{value}</dd>
    </div>
  );
}

function MarkdownSource({ content }: { content: string }) {
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-[rgba(216,236,248,0.1)] bg-[rgba(2,6,23,0.82)] p-4 font-mono text-[#d8ecf8] text-sm leading-6">
      <code>{content}</code>
    </pre>
  );
}

function ShareLoadingSkeleton() {
  return (
    <main
      aria-busy="true"
      className="relative min-h-screen overflow-hidden bg-[#05060f] text-white"
    >
      <span className="sr-only">Loading shared Markdown</span>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.42)_22deg,transparent_52deg)] blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <section className="min-w-0 max-w-3xl">
            <div className="mb-6 animate-pulse pb-4">
              <div className="mb-4 h-3 w-32 rounded-full bg-[#2b3551]" />
              <div className="space-y-3">
                <div className="h-10 w-full max-w-2xl rounded-lg bg-[#d8ecf8]/18 sm:h-12" />
                <div className="h-10 w-4/5 rounded-lg bg-[#d8ecf8]/14 sm:h-12" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="h-4 w-28 rounded-full bg-[#2b3551]" />
                <div className="h-4 w-24 rounded-full bg-[#2b3551]" />
                <div className="h-4 w-16 rounded-full bg-[#2b3551]" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <div className="h-10 w-40 rounded-lg border border-white/10 bg-[#101426]" />
                <div className="size-10 rounded-lg border border-white/10 bg-[#101426]" />
                <div className="size-10 rounded-lg border border-white/10 bg-[#101426]" />
              </div>
            </div>

            <div className="animate-pulse space-y-5">
              <div className="h-5 w-3/4 rounded-full bg-[#d8ecf8]/16" />
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 w-11/12 rounded-full bg-[#263250]" />
              </div>
              <div className="h-52 rounded-lg border border-[rgba(216,236,248,0.1)] bg-[#090d1a]/80" />
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 w-5/6 rounded-full bg-[#263250]" />
                <div className="h-4 w-2/3 rounded-full bg-[#263250]" />
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-10 animate-pulse border-[rgba(216,236,248,0.16)] border-l pl-5">
              <div className="mb-4 h-4 w-20 rounded-full bg-[#d8ecf8]/16" />
              <div className="space-y-3">
                <div className="h-3 w-32 rounded-full bg-[#263250]" />
                <div className="h-3 w-40 rounded-full bg-[#263250]" />
                <div className="h-3 w-28 rounded-full bg-[#263250]" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function toMarkdownFileName(title: string) {
  const fileName = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return fileName || "shared-markdown";
}

async function copyMarkdownToClipboard(content: string) {
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch {
    const textarea = document.createElement("textarea");

    textarea.value = content;
    textarea.setAttribute("readonly", "");
    textarea.style.left = "-9999px";
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      return document.execCommand("copy");
    } finally {
      textarea.remove();
    }
  }
}

function outlinesAreEqual(
  currentItems: MarkdownOutlineItem[],
  nextItems: MarkdownOutlineItem[],
) {
  if (currentItems.length !== nextItems.length) {
    return false;
  }

  return currentItems.every((item, index) => {
    const nextItem = nextItems[index];

    return (
      nextItem !== undefined &&
      item.id === nextItem.id &&
      item.text === nextItem.text &&
      item.depth === nextItem.depth
    );
  });
}

function OutlineNav({ outline }: { outline: MarkdownOutlineItem[] }) {
  return (
    <nav aria-label="Table of contents">
      <ol className="flex flex-col gap-2 pt-3 text-sm lg:pt-0">
        {outline.map((item) => (
          <li key={item.id}>
            <a
              className="block text-[#9da7ba] hover:text-[#d8ecf8]"
              href={`#${item.id}`}
              style={{
                paddingLeft: `${Math.max(0, item.depth - 1) * 0.75}rem`,
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
