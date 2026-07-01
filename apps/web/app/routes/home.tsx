import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { trpc } from "../trpc";
import type { Route } from "./+types/home";

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
  const [expiresIn, setExpiresIn] = useState<
    "never" | "1h" | "24h" | "7d" | "30d"
  >("never");
  const [deleteAfterRead, setDeleteAfterRead] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [shareSlug, setShareSlug] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.endsWith(".md") && !file.name.endsWith(".markdown")) {
      setError("Choose a Markdown file ending in .md or .markdown.");
      return;
    }

    setError("");
    setTitle(file.name.replace(/\.(md|markdown)$/i, ""));
    setContent(await file.text());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setError("");
    setShareUrl("");
    setShareSlug("");

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
  }

  async function handleDeleteShare() {
    if (!shareSlug) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await trpc.share.delete.mutate({ slug: shareSlug });
      setShareUrl("");
      setShareSlug("");
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
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-12">
      <header className="mb-8">
        <p className="mb-3 font-medium text-sky-700 text-sm uppercase tracking-wide dark:text-sky-300">
          SpecsDrop
        </p>
        <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">
          Upload Markdown and share the URL.
        </h1>
      </header>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-2">
          <span className="font-medium text-sm">Markdown file</span>
          <input
            accept=".md,.markdown,text/markdown,text/plain"
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-zinc-950"
            onChange={handleFileChange}
            type="file"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium text-sm">Title</span>
          <input
            className="rounded border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-zinc-950"
            maxLength={120}
            onChange={(event) => setTitle(event.currentTarget.value)}
            placeholder="Optional document title"
            type="text"
            value={title}
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium text-sm">Markdown</span>
          <textarea
            className="min-h-80 resize-y rounded border border-slate-300 bg-white px-3 py-2 font-mono text-sm leading-6 dark:border-slate-700 dark:bg-zinc-950"
            onChange={(event) => setContent(event.currentTarget.value)}
            placeholder="# Paste Markdown here"
            value={content}
          />
        </label>

        <fieldset className="grid gap-4 rounded border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-3">
          <legend className="px-1 font-medium text-sm">Sharing controls</legend>

          <label className="flex flex-col gap-2">
            <span className="font-medium text-sm">Expires</span>
            <select
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-zinc-950"
              onChange={(event) =>
                setExpiresIn(
                  event.currentTarget.value as
                    | "never"
                    | "1h"
                    | "24h"
                    | "7d"
                    | "30d",
                )
              }
              value={expiresIn}
            >
              <option value="never">Never</option>
              <option value="1h">In 1 hour</option>
              <option value="24h">In 24 hours</option>
              <option value="7d">In 7 days</option>
              <option value="30d">In 30 days</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="font-medium text-sm">Max views</span>
            <input
              className="rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-zinc-950"
              min={1}
              max={10_000}
              onChange={(event) => setMaxViews(event.currentTarget.value)}
              placeholder="No limit"
              type="number"
              value={maxViews}
            />
          </label>

          <label className="flex items-center gap-3 pt-7 text-sm">
            <input
              checked={deleteAfterRead}
              className="size-4"
              onChange={(event) =>
                setDeleteAfterRead(event.currentTarget.checked)
              }
              type="checkbox"
            />
            Delete after first view
          </label>
        </fieldset>

        {error ? (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm dark:border-red-950 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <button
          className="w-fit rounded bg-slate-950 px-4 py-2 font-medium text-sm text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          disabled={isCreating}
          type="submit"
        >
          {isCreating ? "Generating..." : "Generate share URL"}
        </button>
      </form>

      {shareUrl ? (
        <section className="mt-8 border-slate-200 border-t pt-6 dark:border-slate-800">
          <p className="mb-2 font-medium text-sm">Share URL</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-zinc-950"
              readOnly
              value={shareUrl}
            />
            <button
              className="rounded border border-slate-300 px-4 py-2 font-medium text-sm dark:border-slate-700"
              onClick={handleCopy}
              type="button"
            >
              Copy
            </button>
            <a
              className="rounded border border-slate-300 px-4 py-2 text-center font-medium text-sm dark:border-slate-700"
              href={shareUrl}
            >
              Open
            </a>
            <button
              className="rounded border border-red-200 px-4 py-2 font-medium text-red-700 text-sm disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-950 dark:text-red-200"
              disabled={isDeleting}
              onClick={handleDeleteShare}
              type="button"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </section>
      ) : null}
    </main>
  );
}
