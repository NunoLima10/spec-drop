import { getSharePreviewBySlug } from "@specdrop/api";
import {
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  Code2Icon,
  CopyIcon,
  DownloadIcon,
  EyeIcon,
  FileTextIcon,
  InfinityIcon,
  QrCodeIcon,
  SparklesIcon,
  TimerIcon,
  Trash2Icon,
} from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ReactNode, SVGProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RouterContextProvider } from "react-router";
import { useLoaderData, useParams } from "react-router";
import { ShareQrCode } from "~/components/share-qr-code";
import { StatusPage } from "~/components/status-page";
import { Button } from "~/components/ui/button";
import { dbContext, originContext } from "~/router-context";
import {
  buildAiOpenUrl,
  buildAiReviewPrompt,
  buildMarkdownFileUrl,
} from "../ai-open-links";
import type { MarkdownOutlineItem } from "../markdown-plugins";
import { MarkdownRenderer } from "../markdown-renderer";
import { saveShareHistoryItem } from "../share-history";
import { estimateReadingTime } from "../share-metadata";
import { trpc } from "../trpc";

type PreviewMode = "render" | "code";
type ShareLoaderData = {
  canonicalUrl: string;
  previewTitle: string | null;
};

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

const defaultSharePreviewTitle = "Shared Markdown";
const sharePreviewDescription =
  "A shared Markdown spec published with SpecsDrop.";

export async function loader({
  context,
  params,
  request,
}: {
  context: RouterContextProvider;
  params: { slug?: string };
  request: Request;
}): Promise<ShareLoaderData> {
  const requestUrl = new URL(request.url);
  const origin = context.get(originContext) ?? requestUrl.origin;
  const db = context.get(dbContext);
  const slug = params.slug ?? "";
  const canonicalUrl = slug
    ? new URL(`/s/${slug}`, origin).toString()
    : requestUrl.toString();

  if (!slug || !db) {
    return {
      canonicalUrl,
      previewTitle: null,
    };
  }

  const preview = await getSharePreviewBySlug(db, slug);

  return {
    canonicalUrl,
    previewTitle: preview?.title ?? null,
  };
}

export function getSharePageTitle(previewTitle: string | null): string {
  return `${previewTitle || defaultSharePreviewTitle} | SpecsDrop`;
}

export function meta({ data }: { data?: ShareLoaderData }) {
  const pageTitle = getSharePageTitle(data?.previewTitle ?? null);
  const url = data?.canonicalUrl;

  return [
    { title: pageTitle },
    {
      name: "description",
      content: sharePreviewDescription,
    },
    {
      property: "og:type",
      content: "article",
    },
    {
      property: "og:site_name",
      content: "SpecsDrop",
    },
    {
      property: "og:title",
      content: pageTitle,
    },
    {
      property: "og:description",
      content: sharePreviewDescription,
    },
    ...(url
      ? [
          {
            property: "og:url",
            content: url,
          },
        ]
      : []),
    {
      name: "twitter:card",
      content: "summary",
    },
    {
      name: "twitter:title",
      content: pageTitle,
    },
    {
      name: "twitter:description",
      content: sharePreviewDescription,
    },
  ];
}

function ReadingProgressBar() {
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId = 0;

    function updateProgress() {
      const progressBar = progressRef.current;

      if (!progressBar) {
        return;
      }

      progressBar.style.width = `${getReadingProgress({
        scrollHeight: document.documentElement.scrollHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
      })}%`;
    }

    function scheduleUpdateProgress() {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        updateProgress();
      });
    }

    updateProgress();
    window.addEventListener("scroll", scheduleUpdateProgress, {
      passive: true,
    });
    window.addEventListener("resize", scheduleUpdateProgress);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("scroll", scheduleUpdateProgress);
      window.removeEventListener("resize", scheduleUpdateProgress);
    };
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 h-1 bg-[#663af3]"
      ref={progressRef}
      style={{ width: "0%" }}
    />
  );
}

export function getReadingProgress({
  scrollHeight,
  scrollY,
  viewportHeight,
}: {
  scrollHeight: number;
  scrollY: number;
  viewportHeight: number;
}) {
  const scrollable = scrollHeight - viewportHeight;

  if (scrollable <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, (scrollY / scrollable) * 100));
}

export default function Share() {
  const { slug } = useParams();
  const [state, setState] = useState<ShareState>({ status: "loading" });
  const [outline, setOutline] = useState<MarkdownOutlineItem[]>([]);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("render");
  const [copyStatus, setCopyStatus] = useState("");
  const { canonicalUrl: sharePageUrl } = useLoaderData<ShareLoaderData>();
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

  useEffect(() => {
    if (state.status !== "ready" || !slug) {
      return;
    }

    saveShareHistoryItem({
      slug,
      title: state.share.title,
      url: sharePageUrl,
      expiresAt: state.share.expiresAt,
      deleteAfterRead: state.share.deleteAfterRead,
      maxViews: state.share.maxViews,
      source: "opened",
    });
  }, [sharePageUrl, slug, state]);

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
  const markdownUrl = buildMarkdownFileUrl(sharePageUrl);

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
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <>
      <ReadingProgressBar />
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
                  content={share.content}
                  copyStatus={copyStatus}
                  mode={previewMode}
                  onCopyMarkdown={handleCopyMarkdown}
                  onDownloadMarkdown={handleDownloadMarkdown}
                  setMode={setPreviewMode}
                  markdownUrl={markdownUrl}
                  shareUrl={sharePageUrl}
                  title={title}
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

function AiOpenMenu({ prompt }: { prompt: string }) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          aria-label="Open page actions"
          className="h-9 border-[rgba(216,236,248,0.18)] bg-[#05060f]/70 px-3 text-[#d1e4fa] hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10"
          size="sm"
          title="Open in"
          type="button"
          variant="outline"
        >
          <SparklesIcon aria-hidden="true" data-icon="inline-start" />
          Ask AI
          <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="start"
          className="z-50 min-w-48 rounded-lg border border-[rgba(216,236,248,0.16)] bg-[#111218] p-1 text-[#eef5ff] shadow-[0_18px_48px_rgba(0,0,0,0.36)]"
          sideOffset={6}
        >
          <AiOpenMenuLink
            href={buildAiOpenUrl("chatgpt", prompt)}
            icon={<ChatGptLogo className="size-4 text-[#eef5ff]" />}
          >
            ChatGPT
          </AiOpenMenuLink>
          <AiOpenMenuLink
            href={buildAiOpenUrl("claude", prompt)}
            icon={<ClaudeLogo className="size-4" />}
          >
            Claude
          </AiOpenMenuLink>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

function AiOpenMenuLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon: ReactNode;
}) {
  return (
    <DropdownMenuPrimitive.Item asChild>
      <a
        className="flex cursor-default items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none select-none focus:bg-white/10"
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {icon}
        {children}
      </a>
    </DropdownMenuPrimitive.Item>
  );
}

function ChatGptLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      strokeWidth="1.5"
      viewBox="-0.17090198558635983 0.482230148717937 41.14235318283891 40.0339509076386"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835A9.964 9.964 0 0 0 18.306.5a10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 7.516 3.35 10.078 10.078 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.813zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zm-16.106-6.88a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.01L7.04 23.856a7.504 7.504 0 0 1-2.743-10.237zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .113-.01l8.052 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.65-1.132zm3.35-5.043a7.395 7.395 0 0 0-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zM16.071 18l4.33-2.501 4.332 2.5v5l-4.331 2.5-4.331-2.5V18z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClaudeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 6.603 1192.672 1193.397"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="m233.96 800.215 234.684-131.678 3.947-11.436-3.947-6.363h-11.436l-39.221-2.416-134.094-3.624-116.296-4.832-112.67-6.04-28.35-6.04-26.577-35.035 2.738-17.477 23.84-16.027 34.147 2.98 75.463 5.155 113.235 7.812 82.147 4.832 121.692 12.644h19.329l2.738-7.812-6.604-4.832-5.154-4.832-117.182-79.41-126.845-83.92-66.443-48.321-35.92-24.484-18.12-22.953-7.813-50.093 32.618-35.92 43.812 2.98 11.195 2.98 44.375 34.147 94.792 73.37 123.786 91.167 18.12 15.06 7.249-5.154.886-3.624-8.135-13.61-67.329-121.692-71.838-123.785-31.974-51.302-8.456-30.765c-2.98-12.645-5.154-23.275-5.154-36.242l37.127-50.416 20.537-6.604 49.53 6.604 20.86 18.121 30.765 70.39 49.852 110.818 77.315 150.684 22.631 44.698 12.08 41.396 4.51 12.645h7.813v-7.248l6.362-84.886 11.759-104.215 11.436-134.094 3.946-37.772 18.685-45.262 37.127-24.482 28.994 13.852 23.839 34.148-3.303 22.067-14.174 92.134-27.785 144.323-18.121 96.644h10.55l12.08-12.08 48.887-64.913 82.147-102.685 36.242-40.752 42.282-45.02 27.14-21.423h51.303l37.772 56.135-16.913 57.986-52.832 67.007-43.812 56.779-62.82 84.563-39.22 67.651 3.623 5.396 9.343-.886 141.906-30.201 76.671-13.852 91.49-15.705 41.396 19.329 4.51 19.65-16.269 40.189-97.852 24.16-114.764 22.954-170.9 40.43-2.093 1.53 2.416 2.98 76.993 7.248 32.94 1.771h80.617l150.12 11.195 39.222 25.933 23.517 31.732-3.946 24.16-60.403 30.766-81.503-19.33-190.228-45.26-65.235-16.27h-9.02v5.397l54.362 53.154 99.624 89.96 124.752 115.973 6.362 28.671-16.027 22.63-16.912-2.415-109.611-82.47-42.282-37.127-95.758-80.618h-6.363v8.456l22.067 32.296 116.537 175.167 6.04 53.719-8.456 17.476-30.201 10.55-33.181-6.04-68.215-95.758-70.39-107.84-56.778-96.644-6.926 3.947-33.503 360.886-15.705 18.443-36.243 13.852-30.201-22.953-16.027-37.127 16.027-73.37 19.329-95.758 15.704-76.107 14.175-94.55 8.456-31.41-.563-2.094-6.927.886-71.275 97.852-108.402 146.497-85.772 91.812-20.537 8.134-35.597-18.443 3.301-32.94 19.893-29.315 118.712-151.007 71.597-93.583 46.228-54.04-.322-7.813h-2.738l-315.302 204.725-56.135 7.248-24.16-22.63 2.98-37.128 11.435-12.08 94.792-65.236-.322.323z"
        fill="#d97757"
      />
    </svg>
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
