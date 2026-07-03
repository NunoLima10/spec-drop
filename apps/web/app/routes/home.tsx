import {
  ArrowRightIcon,
  CheckIcon,
  ChevronDownIcon,
  Code2Icon,
  CopyIcon,
  ExternalLinkIcon,
  EyeIcon,
  FileUpIcon,
  PlusIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { MarkdownRenderer } from "../markdown-renderer";
import { trpc } from "../trpc";
import {
  getMarkdownFileError,
  inferTitleFromMarkdownHeading,
  inferTitleFromMarkdownUpload,
} from "../upload-utils";
import type { Route } from "./+types/home";

type ShareExpiration = "never" | "1h" | "24h" | "7d" | "30d";
type PreviewMode = "render" | "code";

type ComposerProps = {
  canCreate: boolean;
  content: string;
  deleteAfterRead: boolean;
  error: string;
  expiresIn: ShareExpiration;
  handleContentChange: (content: string) => void;
  handleDragLeave: (event: DragEvent<HTMLElement>) => void;
  handleDragOver: (event: DragEvent<HTMLElement>) => void;
  handleDrop: (event: DragEvent<HTMLElement>) => Promise<void>;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleNewMarkdown: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  isCreating: boolean;
  isDraggingFile: boolean;
  maxViews: string;
  setDeleteAfterRead: (enabled: boolean) => void;
  setExpiresIn: (expiresIn: ShareExpiration) => void;
  setIsTitleManuallyEdited: (isEdited: boolean) => void;
  setMaxViews: (maxViews: string) => void;
  setTitle: (title: string) => void;
  title: string;
};

export function meta(_: Route.MetaArgs) {
  return [
    { title: "SpecsDrop" },
    {
      name: "description",
      content: "Publish Markdown specs as shareable web pages.",
    },
  ];
}

export default function Home() {
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
  const canCreate = content.trim().length > 0 && !isCreating;

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

    if (!content.trim()) {
      setError("Paste or drop Markdown before generating a share URL.");
      return;
    }

    setIsCreating(true);
    setError("");
    setShareUrl("");
    setShareSlug("");
    setCopyStatus("");

    try {
      const share = await trpc.share.create.mutate({
        title: title || undefined,
        content,
        expiresIn,
        deleteAfterRead,
        maxViews: maxViews ? Number(maxViews) : undefined,
      });

      setShareUrl(share.url);
      setShareSlug(share.slug);
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

    await navigator.clipboard.writeText(shareUrl);
    setCopyStatus("Copied");
  }

  async function handleDeleteShare() {
    if (!shareSlug) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await trpc.share.delete.mutate({ slug: shareSlug });
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-14rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.5)_22deg,transparent_52deg)] blur-2xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
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
      </section>
    </main>
  );
}

function DropComposer({
  canCreate,
  content,
  deleteAfterRead,
  error,
  expiresIn,
  handleContentChange,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  handleNewMarkdown,
  handleSubmit,
  isCreating,
  isDraggingFile,
  maxViews,
  setDeleteAfterRead,
  setExpiresIn,
  setIsTitleManuallyEdited,
  setMaxViews,
  setTitle,
  title,
}: ComposerProps) {
  const hasContent = content.trim().length > 0;

  return (
    <form
      className={
        hasContent
          ? "rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-3 shadow-[inset_0_1px_1px_rgba(216,236,248,0.16),inset_0_24px_48px_rgba(168,216,245,0.05),0_16px_48px_rgba(0,0,0,0.42)] sm:p-4"
          : ""
      }
      onSubmit={handleSubmit}
    >
      {hasContent ? (
        <LoadedComposer
          canCreate={canCreate}
          deleteAfterRead={deleteAfterRead}
          error={error}
          expiresIn={expiresIn}
          handleNewMarkdown={handleNewMarkdown}
          isCreating={isCreating}
          maxViews={maxViews}
          setDeleteAfterRead={setDeleteAfterRead}
          setExpiresIn={setExpiresIn}
          setIsTitleManuallyEdited={setIsTitleManuallyEdited}
          setMaxViews={setMaxViews}
          setTitle={setTitle}
          title={title}
        />
      ) : (
        <MarkdownIngress
          error={error}
          handleContentChange={handleContentChange}
          handleDragLeave={handleDragLeave}
          handleDragOver={handleDragOver}
          handleDrop={handleDrop}
          handleFileChange={handleFileChange}
          isDraggingFile={isDraggingFile}
        />
      )}
    </form>
  );
}

function MarkdownIngress({
  error,
  handleContentChange,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  isDraggingFile,
}: Pick<
  ComposerProps,
  | "error"
  | "handleContentChange"
  | "handleDragLeave"
  | "handleDragOver"
  | "handleDrop"
  | "handleFileChange"
  | "isDraggingFile"
>) {
  return (
    <>
      <fieldset
        className={`rounded-xl border border-dashed transition ${
          isDraggingFile
            ? "border-[#663af3] bg-[#10112a] text-white"
            : "border-[rgba(216,236,248,0.72)] bg-[#070914] text-[#d1e4fa]"
        }`}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <legend className="sr-only">Drop Markdown file</legend>
        <label
          className="flex min-h-72 cursor-pointer flex-col items-center justify-start rounded-xl p-6 pt-16 text-center sm:min-h-80 sm:pt-20"
          htmlFor="markdown-file"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-[#663af3] text-white shadow-[0_0_32px_rgba(102,58,243,0.4)]">
            <FileUpIcon aria-hidden="true" className="size-6" />
          </span>
          <span className="mt-5 font-medium text-2xl text-white">
            Drop md here
          </span>
          <span className="mt-2 max-w-sm text-[#9da7ba] text-sm leading-6">
            Choose a Markdown file from your machine or drag it into this
            surface.
          </span>
          <input
            accept=".md,.markdown,text/markdown,text/plain"
            className="sr-only"
            id="markdown-file"
            onChange={handleFileChange}
            type="file"
          />
        </label>
      </fieldset>

      <Textarea
        aria-label="Paste Markdown"
        className="mt-3 max-h-52 min-h-24 resize-y rounded-lg border-[rgba(216,236,248,0.72)] bg-[#070914] px-4 py-3 font-mono text-[#d1e4fa] text-sm placeholder:text-[#9da7ba]"
        onChange={(event) => handleContentChange(event.currentTarget.value)}
        placeholder="Or paste Markdown here"
        value=""
      />

      {error ? (
        <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-red-200 text-sm">
          {error}
        </p>
      ) : null}
    </>
  );
}

function LoadedComposer({
  canCreate,
  deleteAfterRead,
  error,
  expiresIn,
  handleNewMarkdown,
  isCreating,
  maxViews,
  setDeleteAfterRead,
  setExpiresIn,
  setIsTitleManuallyEdited,
  setMaxViews,
  setTitle,
  title,
}: Omit<
  ComposerProps,
  | "content"
  | "handleDragLeave"
  | "handleDragOver"
  | "handleDrop"
  | "handleContentChange"
  | "handleFileChange"
  | "handleSubmit"
  | "isDraggingFile"
>) {
  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 lg:max-w-xl">
          <Label className="sr-only" htmlFor="share-title">
            Title
          </Label>
          <Input
            className="h-10 rounded-lg border-[rgba(216,236,248,0.5)] bg-[#070914] px-3 font-medium text-lg text-white placeholder:text-[#9da7ba]"
            id="share-title"
            maxLength={120}
            onChange={(event) => {
              setIsTitleManuallyEdited(true);
              setTitle(event.currentTarget.value);
            }}
            placeholder="Title of preview input"
            type="text"
            value={title}
          />

          <details className="group mt-3">
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 text-[#d1e4fa] text-sm hover:text-white [&::-webkit-details-marker]:hidden">
              <Settings2Icon aria-hidden="true" className="size-4" />
              <span>More config</span>
              <ChevronDownIcon
                aria-hidden="true"
                className="size-4 transition group-open:rotate-180"
              />
            </summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label className="text-[#d1e4fa]" htmlFor="share-expiration">
                  Expires
                </Label>
                <Select
                  onValueChange={(value) =>
                    setExpiresIn(value as ShareExpiration)
                  }
                  value={expiresIn}
                >
                  <SelectTrigger
                    className="w-full border-[rgba(216,236,248,0.22)] bg-[#070914] text-white placeholder:text-[#9da7ba]"
                    id="share-expiration"
                  >
                    <SelectValue placeholder="Choose expiration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1h">In 1 hour</SelectItem>
                    <SelectItem value="24h">In 24 hours</SelectItem>
                    <SelectItem value="7d">In 7 days</SelectItem>
                    <SelectItem value="30d">In 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-[#d1e4fa]" htmlFor="share-max-views">
                  Max views
                </Label>
                <Input
                  className="border-[rgba(216,236,248,0.22)] bg-[#070914] text-white placeholder:text-[#9da7ba]"
                  id="share-max-views"
                  max={10_000}
                  min={1}
                  onChange={(event) => setMaxViews(event.currentTarget.value)}
                  placeholder="No limit"
                  type="number"
                  value={maxViews}
                />
              </div>

              <div className="flex items-center gap-3 sm:pt-6">
                <Switch
                  aria-label="Delete after first view"
                  checked={deleteAfterRead}
                  id="delete-after-read"
                  onCheckedChange={setDeleteAfterRead}
                />
                <Label className="text-[#d1e4fa]" htmlFor="delete-after-read">
                  Delete after first view
                </Label>
              </div>
            </div>
          </details>
        </div>

        <div className="flex shrink-0 gap-2 lg:justify-end">
          <Button
            className="h-10 border-[rgba(216,236,248,0.2)] bg-[#070914] px-3 text-[#d1e4fa] hover:bg-[#101328] hover:text-white"
            onClick={handleNewMarkdown}
            type="button"
            variant="outline"
          >
            <PlusIcon aria-hidden="true" data-icon="inline-start" />
            New
          </Button>
          <Button
            className="h-10 rounded-lg bg-[#663af3] px-4 text-white hover:bg-[#5930db] sm:min-w-40"
            disabled={!canCreate}
            type="submit"
          >
            {isCreating ? "Generating..." : "Generate URL"}
            <ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
          </Button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-red-200 text-sm">
          {error}
        </p>
      ) : null}
    </>
  );
}

function PreviewStage({
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

function PreviewToggle({
  mode,
  setMode,
}: {
  mode: PreviewMode;
  setMode: (mode: PreviewMode) => void;
}) {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-[#05060f] p-1">
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
  );
}

function ShareResult({
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
  return (
    <section className="rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-4 text-[#d1e4fa] shadow-[inset_0_1px_1px_rgba(199,211,234,0.12),inset_0_24px_48px_rgba(199,211,234,0.05),0_24px_32px_rgba(6,6,14,0.7)] sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[16rem_1fr] lg:items-center">
        <div className="flex aspect-square items-center justify-center rounded-xl border border-[rgba(216,236,248,0.18)] bg-[#05060f] p-5">
          <div
            aria-hidden="true"
            className="grid size-full grid-cols-5 grid-rows-5 gap-2"
          >
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                className={
                  qrBlocks.has(index)
                    ? "rounded-sm bg-[#d8ecf8]"
                    : "rounded-sm bg-[#151827]"
                }
                key={index}
              />
            ))}
          </div>
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

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              className="h-10 bg-[#663af3] px-4 text-white hover:bg-[#5930db]"
              onClick={handleCopy}
              type="button"
            >
              <CopyIcon aria-hidden="true" data-icon="inline-start" />
              {copyStatus || "Quick copy"}
            </Button>
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

const qrBlocks = new Set([
  0, 1, 2, 4, 5, 7, 9, 10, 12, 14, 15, 16, 18, 20, 22, 23, 24,
]);
