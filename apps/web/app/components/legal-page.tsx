import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { SiteFooter } from "~/components/site-footer";

const repositoryUrl = "https://github.com/NunoLima10/spec-drop";

export function LegalPage({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#05060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.42)_22deg,transparent_52deg)] blur-2xl" />

      <article className="relative mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          className="inline-flex items-center gap-2 text-[#c7d3ea] text-sm hover:text-white"
          to="/"
        >
          <ArrowLeftIcon aria-hidden="true" className="size-4" />
          Back to SpecsDrop
        </Link>

        <header className="mt-10 border-[rgba(216,236,248,0.16)] border-b pb-8">
          <p className="text-[#9fd8f7] text-sm uppercase tracking-wide">
            Last updated September 13, 2026
          </p>
          <h1 className="mt-3 bg-[linear-gradient(0deg,#f8fbff_0%,#9fd8f7_100%)] bg-clip-text font-medium text-4xl text-transparent leading-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-[#c7d3ea] text-base leading-7">
            {description}
          </p>
        </header>

        <div className="legal-copy py-8">{children}</div>

        <div className="mb-10 rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-5 text-[#c7d3ea] text-sm leading-6">
          SpecsDrop is open source. You can inspect the implementation, report
          issues, or deploy your own instance from the{" "}
          <a
            className="inline-flex items-center gap-1 text-[#9fd8f7] underline"
            href={repositoryUrl}
            rel="noreferrer"
            target="_blank"
          >
            GitHub repository
            <ExternalLinkIcon aria-hidden="true" className="size-3.5" />
          </a>
          .
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
