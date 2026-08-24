import { BookOpenIcon } from "lucide-react";
import { MarkdownRenderer } from "~/lib/markdown/renderer";
import { homeReadmeMarkdown } from "../home-readme-content";

export function HomeReadme() {
  return (
    <section
      aria-label="Rendered SpecsDrop README"
      className="mt-16 w-full max-w-5xl sm:mt-20"
    >
      <p className="mb-5 inline-flex items-center gap-2 text-[#c7d3ea] text-sm uppercase tracking-normal">
        <BookOpenIcon aria-hidden="true" className="size-4" />
        Rendered with SpecsDrop
      </p>

      <article className="specdrop-reader specdrop-readme rounded-xl border border-[rgba(216,236,248,0.16)] bg-[#070914] p-4 shadow-[inset_0_1px_1px_rgba(199,211,234,0.12),inset_0_24px_48px_rgba(199,211,234,0.05),0_24px_32px_rgba(6,6,14,0.7)] sm:p-6">
        <MarkdownRenderer content={homeReadmeMarkdown} />
      </article>
    </section>
  );
}
