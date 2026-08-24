import {
  ArrowRightIcon,
  ChevronDownIcon,
  FileUpIcon,
  PlusIcon,
  Settings2Icon,
} from "lucide-react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
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
import type { ShareExpiration } from "../share-form";

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

export function DropComposer({
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
          content={content}
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
  content,
  error,
  handleContentChange,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  handleFileChange,
  isDraggingFile,
}: Pick<
  ComposerProps,
  | "content"
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
        value={content}
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
