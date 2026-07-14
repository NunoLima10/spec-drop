import type { SVGProps } from "react";
import { useEffect, useState } from "react";

const authorUrl = "https://nunolima.cv/";
const repositoryUrl = "https://github.com/NunoLima10/spec-drop";
const repositoryApiUrl = "https://api.github.com/repos/NunoLima10/spec-drop";

export function SiteFooter() {
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    let isCurrent = true;

    async function loadStarCount() {
      try {
        const response = await fetch(repositoryApiUrl, {
          headers: { Accept: "application/vnd.github+json" },
        });

        if (!response.ok) {
          return;
        }

        const repository = (await response.json()) as {
          stargazers_count?: number;
        };

        if (isCurrent && typeof repository.stargazers_count === "number") {
          setStarCount(repository.stargazers_count);
        }
      } catch {
        // The footer link still works when GitHub's API is unavailable.
      }
    }

    void loadStarCount();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <footer className="relative w-full border-[rgba(216,236,248,0.12)] border-t text-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 text-[#9da7ba] sm:flex-row sm:items-center sm:justify-between">
        <p>
          Made By{" "}
          <a
            className="font-medium text-[#d8ecf8] underline-offset-4 hover:text-white hover:underline"
            href={authorUrl}
            rel="noreferrer"
            target="_blank"
          >
            Nuno Lima
          </a>
        </p>

        <a
          aria-label="Open NunoLima10/spec-drop on GitHub"
          className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-[rgba(216,236,248,0.18)] bg-transparent px-3 font-medium text-[#d8ecf8] transition hover:border-[rgba(216,236,248,0.32)] hover:bg-white/5 hover:text-white"
          href={repositoryUrl}
          rel="noreferrer"
          target="_blank"
        >
          <GithubIcon aria-hidden="true" className="size-4" />
          <span>{starCount === null ? "0" : formatStarCount(starCount)}</span>
        </a>
      </div>
    </footer>
  );
}

function formatStarCount(starCount: number) {
  return new Intl.NumberFormat("en", {
    notation: starCount >= 1000 ? "compact" : "standard",
  }).format(starCount);
}

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
      <title>GitHub</title>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}
