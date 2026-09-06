import { useCallback, useEffect, useState } from "react";
import { useLoaderData, useParams } from "react-router";
import { StatusPage } from "~/components/status-page";
import { downloadMarkdownFile } from "~/features/shares/share-file";
import { saveShareHistoryItem } from "~/features/shares/share-history";
import { buildMarkdownFileUrl } from "~/features/shares/share-links";
import { copyTextToClipboard } from "~/lib/browser/clipboard";
import type { MarkdownOutlineItem } from "~/lib/markdown/plugins";
import { MarkdownRenderer } from "~/lib/markdown/renderer";
import { trpc } from "~/lib/trpc";
import { MarkdownSource } from "../components/markdown-source";
import { OutlineNav, outlinesAreEqual } from "../components/outline-nav";
import { ReadingProgressBar } from "../components/reading-progress-bar";
import { ShareActions } from "../components/share-actions";
import { ShareLoadingSkeleton } from "../components/share-loading-skeleton";
import { ShareMetadataList } from "../components/share-metadata-list";
import { estimateReadingTime } from "../share-metadata";
import {
  canPersistShareScrollPosition,
  getRestorableScrollY,
  readShareScrollPosition,
  saveShareScrollPosition,
} from "../share-scroll-position";
import type { PreviewMode, ShareLoaderData, ShareState } from "../types";

export function ShareReadPage() {
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

  useEffect(() => {
    if (
      state.status !== "ready" ||
      !slug ||
      !canPersistShareScrollPosition(state.share)
    ) {
      return;
    }

    const position = readShareScrollPosition(slug);

    if (!position) {
      return;
    }

    let timeoutId = 0;
    const frameId = window.requestAnimationFrame(() => {
      const restoreScroll = () => {
        window.scrollTo({
          top: getRestorableScrollY({
            position,
            scrollHeight: document.documentElement.scrollHeight,
            viewportHeight: window.innerHeight,
          }),
          behavior: "auto",
        });
      };

      restoreScroll();
      timeoutId = window.setTimeout(restoreScroll, 250);
    });

    return () => {
      window.cancelAnimationFrame(frameId);

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [slug, state]);

  useEffect(() => {
    if (
      state.status !== "ready" ||
      !slug ||
      !canPersistShareScrollPosition(state.share)
    ) {
      return;
    }

    let animationFrameId = 0;
    const shareSlug = slug;

    function saveCurrentPosition() {
      saveShareScrollPosition({
        slug: shareSlug,
        scrollY: window.scrollY,
        scrollHeight: document.documentElement.scrollHeight,
        viewportHeight: window.innerHeight,
      });
    }

    function scheduleSaveCurrentPosition() {
      if (animationFrameId) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = 0;
        saveCurrentPosition();
      });
    }

    window.addEventListener("scroll", scheduleSaveCurrentPosition, {
      passive: true,
    });
    window.addEventListener("resize", scheduleSaveCurrentPosition);
    window.addEventListener("pagehide", saveCurrentPosition);
    document.addEventListener("visibilitychange", saveCurrentPosition);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }

      saveCurrentPosition();
      window.removeEventListener("scroll", scheduleSaveCurrentPosition);
      window.removeEventListener("resize", scheduleSaveCurrentPosition);
      window.removeEventListener("pagehide", saveCurrentPosition);
      document.removeEventListener("visibilitychange", saveCurrentPosition);
    };
  }, [slug, state]);

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
    const didCopy = await copyTextToClipboard(share.content);
    setCopyStatus(didCopy ? "Copied" : "Copy failed");
  }

  function handleDownloadMarkdown() {
    downloadMarkdownFile({ content: share.content, title });
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
                <ShareMetadataList
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
