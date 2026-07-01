import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { MarkdownRenderer } from "../markdown-renderer";
import { trpc } from "../trpc";

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

export default function Share() {
  const { slug } = useParams();
  const [state, setState] = useState<ShareState>({ status: "loading" });

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

  if (state.status === "loading") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-slate-600 dark:text-slate-300">Loading...</p>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-semibold text-3xl">Document unavailable</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          {state.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <header className="mb-8 border-slate-200 border-b pb-6 dark:border-slate-800">
        <p className="mb-2 text-slate-500 text-sm dark:text-slate-400">
          Shared Markdown
        </p>
        <h1 className="font-semibold text-3xl">
          {state.share.title || "Untitled Markdown"}
        </h1>
        <p className="mt-2 text-slate-500 text-sm dark:text-slate-400">
          Created {new Date(state.share.createdAt).toLocaleString()}
        </p>
        <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          <div className="flex gap-1">
            <dt className="text-slate-500 dark:text-slate-400">Views:</dt>
            <dd>{state.share.currentViews}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="text-slate-500 dark:text-slate-400">Expires:</dt>
            <dd>
              {state.share.expiresAt
                ? new Date(state.share.expiresAt).toLocaleString()
                : "Never"}
            </dd>
          </div>
          {state.share.maxViews ? (
            <div className="flex gap-1">
              <dt className="text-slate-500 dark:text-slate-400">Max views:</dt>
              <dd>{state.share.maxViews}</dd>
            </div>
          ) : null}
          {state.share.deleteAfterRead ? (
            <div className="flex gap-1">
              <dt className="text-slate-500 dark:text-slate-400">
                Delete-after-read:
              </dt>
              <dd>On</dd>
            </div>
          ) : null}
        </dl>
      </header>

      <MarkdownRenderer content={state.share.content} />
    </main>
  );
}
