import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import type { MarkdownOutlineItem } from "../markdown-plugins";
import { MarkdownRenderer } from "../markdown-renderer";
import { estimateReadingTime } from "../share-metadata";
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
  const readingProgress = useReadingProgress();
  const handleOutlineChange = useCallback((items: MarkdownOutlineItem[]) => {
    setOutline(items);
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

  if (state.status === "loading") {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12" aria-busy="true">
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

  const readingTime = estimateReadingTime(state.share.content);

  return (
    <>
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-sky-500"
        style={{ width: `${readingProgress}%` }}
      />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <section className="min-w-0 max-w-3xl">
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
                  <dt className="text-slate-500 dark:text-slate-400">
                    Reading time:
                  </dt>
                  <dd>{readingTime.text}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-slate-500 dark:text-slate-400">Views:</dt>
                  <dd>{state.share.currentViews}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-slate-500 dark:text-slate-400">
                    Expires:
                  </dt>
                  <dd>
                    {state.share.expiresAt
                      ? new Date(state.share.expiresAt).toLocaleString()
                      : "Never"}
                  </dd>
                </div>
                {state.share.maxViews ? (
                  <div className="flex gap-1">
                    <dt className="text-slate-500 dark:text-slate-400">
                      Max views:
                    </dt>
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

            {outline.length ? (
              <details className="mb-8 rounded border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-zinc-950 lg:hidden">
                <summary className="cursor-pointer font-medium">
                  Contents
                </summary>
                <OutlineNav outline={outline} />
              </details>
            ) : null}

            <MarkdownRenderer
              content={state.share.content}
              onOutlineChange={handleOutlineChange}
            />
          </section>

          {outline.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-8 border-slate-200 border-l pl-5 dark:border-slate-800">
                <p className="mb-3 font-medium text-slate-900 text-sm dark:text-slate-100">
                  Contents
                </p>
                <OutlineNav outline={outline} />
              </div>
            </aside>
          ) : null}
        </div>
      </main>
    </>
  );
}

function OutlineNav({ outline }: { outline: MarkdownOutlineItem[] }) {
  return (
    <nav aria-label="Table of contents">
      <ol className="flex flex-col gap-2 pt-3 text-sm lg:pt-0">
        {outline.map((item) => (
          <li key={item.id}>
            <a
              className="block text-slate-600 hover:text-sky-700 dark:text-slate-300 dark:hover:text-sky-300"
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
