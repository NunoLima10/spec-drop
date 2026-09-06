import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { SiteFooter } from "~/components/site-footer";
import {
  clearShareHistory,
  readShareHistory,
  removeShareHistoryItem,
  SHARE_HISTORY_STORAGE_KEY,
  type ShareHistoryItem,
  saveShareHistoryItem,
} from "~/features/shares/share-history";
import { copyTextToClipboard } from "~/lib/browser/clipboard";
import { trpc } from "~/lib/trpc";
import { DropComposer } from "../components/drop-composer";
import { HomeReadme } from "../components/home-readme";
import { PreviewStage } from "../components/preview-stage";
import { ShareHistoryList } from "../components/share-history-list";
import { ShareResult } from "../components/share-result";
import {
  buildCreateShareInput,
  getCreateShareClientError,
  type ShareExpiration,
} from "../share-form";
import type { PreviewMode } from "../types";
import {
  getMarkdownFileError,
  inferTitleFromMarkdownHeading,
  inferTitleFromMarkdownUpload,
} from "../upload-utils";

export function ShareCreatePage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [expiresIn, setExpiresIn] = useState<ShareExpiration>("never");
  const [deleteAfterRead, setDeleteAfterRead] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareSlug, setShareSlug] = useState("");
  const [error, setError] = useState("");
  const [isTitleManuallyEdited, setIsTitleManuallyEdited] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("render");
  const [shareHistory, setShareHistory] = useState<ShareHistoryItem[]>([]);
  const isIdle = !content.trim() && !shareUrl;
  const canCreate = content.trim().length > 0 && !isCreating;

  useEffect(() => {
    setShareHistory(readShareHistory());

    function handleStorage(event: StorageEvent) {
      if (event.key === SHARE_HISTORY_STORAGE_KEY) {
        setShareHistory(readShareHistory());
      }
    }

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function updateContent(nextContent: string) {
    setContent(nextContent);
    setError("");
    setShareUrl("");
    setShareSlug("");
    setCopyStatus("");

    if (!isTitleManuallyEdited) {
      setTitle(inferTitleFromMarkdownHeading(nextContent) || "");
    }
  }

  async function readMarkdownFile(file: File) {
    const fileError = getMarkdownFileError(file);

    if (fileError) {
      setError(fileError);
      return;
    }

    setError("");
    const fileContent = await file.text();
    setContent(fileContent);
    setShareUrl("");
    setShareSlug("");
    setCopyStatus("");
    setPreviewMode("render");

    if (!isTitleManuallyEdited) {
      setTitle(
        inferTitleFromMarkdownUpload({
          content: fileContent,
          fileName: file.name,
        }),
      );
    }
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (file) {
      await readMarkdownFile(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDraggingFile(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFile(false);
    }
  }

  async function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDraggingFile(false);

    const file = event.dataTransfer.files[0];

    if (file) {
      await readMarkdownFile(file);
    }
  }

  function handleNewMarkdown() {
    setTitle("");
    setContent("");
    setShareUrl("");
    setShareSlug("");
    setError("");
    setIsTitleManuallyEdited(false);
    setCopyStatus("");
    setPreviewMode("render");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const clientError = getCreateShareClientError({ content, maxViews });

    if (clientError) {
      setError(clientError);
      return;
    }

    setIsCreating(true);
    setError("");
    setShareUrl("");
    setShareSlug("");
    setCopyStatus("");

    try {
      const share = await trpc.share.create.mutate(
        buildCreateShareInput({
          title,
          content,
          expiresIn,
          deleteAfterRead,
          maxViews,
        }),
      );

      setShareUrl(share.url);
      setShareSlug(share.slug);
      setShareHistory(
        saveShareHistoryItem({
          slug: share.slug,
          title: share.title ?? title,
          url: share.url,
          expiresAt: share.expiresAt,
          deleteAfterRead: share.deleteAfterRead,
          maxViews: share.maxViews,
          source: "generated",
        }),
      );
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create the share.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) {
      return;
    }

    const didCopy = await copyTextToClipboard(shareUrl);
    setCopyStatus(didCopy ? "Copied" : "Copy failed");
  }

  async function handleDeleteShare() {
    if (!shareSlug) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await trpc.share.delete.mutate({ slug: shareSlug });
      setShareHistory(removeShareHistoryItem(shareSlug));
      handleNewMarkdown();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete the share.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handleRemoveHistoryItem(slug: string) {
    setShareHistory(removeShareHistoryItem(slug));
  }

  function handleClearHistory() {
    setShareHistory(clearShareHistory());
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-14rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.5)_22deg,transparent_52deg)] blur-2xl" />

      <section className="relative mx-auto flex w-full max-w-[1180px] flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <header className="text-center">
          <p className="mb-4 text-[#c7d3ea] text-sm uppercase tracking-normal">
            Frosted document handoff
          </p>
          <h1 className="mx-auto max-w-4xl bg-[linear-gradient(0deg,#d8ecf8_0%,#98c0ef_100%)] bg-clip-text font-medium text-5xl text-transparent leading-none tracking-normal sm:text-6xl lg:text-7xl">
            SpecsDrop
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[#c7d3ea] text-base leading-7 sm:text-lg">
            Drop Markdown, tune the share rules only when needed, and generate a
            polished read-only URL from the preview.
          </p>
        </header>

        <div className="relative mt-10 w-full max-w-5xl">
          {shareUrl ? (
            <ShareResult
              copyStatus={copyStatus}
              error={error}
              handleCopy={handleCopy}
              handleDeleteShare={handleDeleteShare}
              handleNewMarkdown={handleNewMarkdown}
              isDeleting={isDeleting}
              shareUrl={shareUrl}
              title={title}
            />
          ) : (
            <>
              <DropComposer
                canCreate={canCreate}
                content={content}
                deleteAfterRead={deleteAfterRead}
                error={error}
                expiresIn={expiresIn}
                handleContentChange={updateContent}
                handleDragLeave={handleDragLeave}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleFileChange={handleFileChange}
                handleNewMarkdown={handleNewMarkdown}
                handleSubmit={handleSubmit}
                isCreating={isCreating}
                isDraggingFile={isDraggingFile}
                maxViews={maxViews}
                setDeleteAfterRead={setDeleteAfterRead}
                setExpiresIn={setExpiresIn}
                setIsTitleManuallyEdited={setIsTitleManuallyEdited}
                setMaxViews={setMaxViews}
                setTitle={setTitle}
                title={title}
              />

              {content.trim() ? (
                <PreviewStage
                  content={content}
                  mode={previewMode}
                  setMode={setPreviewMode}
                />
              ) : null}
            </>
          )}
        </div>

        <ShareHistoryList
          items={shareHistory}
          onClear={handleClearHistory}
          onRemove={handleRemoveHistoryItem}
        />

        {isIdle ? <HomeReadme /> : null}
      </section>

      <SiteFooter />
    </main>
  );
}
