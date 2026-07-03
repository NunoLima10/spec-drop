import type { LucideIcon } from "lucide-react";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  FileQuestionIcon,
  RefreshCcwIcon,
  SearchIcon,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";

type StatusPageVariant = "error" | "not-found" | "unavailable";

type StatusPageProps = {
  actionLabel?: string;
  description: string;
  icon?: LucideIcon;
  onRetry?: () => void;
  statusCode?: string;
  title: string;
  variant?: StatusPageVariant;
};

const variantStyles: Record<
  StatusPageVariant,
  {
    accent: string;
    icon: LucideIcon;
  }
> = {
  error: {
    accent: "border-red-300/25 bg-red-400/10 text-red-100",
    icon: AlertTriangleIcon,
  },
  "not-found": {
    accent: "border-cyan-200/25 bg-cyan-300/10 text-cyan-100",
    icon: FileQuestionIcon,
  },
  unavailable: {
    accent: "border-amber-200/25 bg-amber-300/10 text-amber-100",
    icon: SearchIcon,
  },
};

export function StatusPage({
  actionLabel = "Back to SpecsDrop",
  description,
  icon,
  onRetry,
  statusCode,
  title,
  variant = "not-found",
}: StatusPageProps) {
  const style = variantStyles[variant];
  const Icon = icon ?? style.icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05060f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.42)_22deg,transparent_52deg)] blur-2xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-12 sm:px-6 lg:px-8">
        <div className="w-full">
          <div className="mb-6">
            <span
              className={`inline-flex h-11 items-center gap-2 rounded-lg border px-3 ${style.accent}`}
            >
              <Icon aria-hidden="true" className="size-5" />
              {statusCode ? (
                <span className="font-mono text-xs text-current">
                  {statusCode}
                </span>
              ) : null}
            </span>
          </div>

          <h1 className="bg-[linear-gradient(0deg,#f8fbff_0%,#9fd8f7_100%)] bg-clip-text font-medium text-4xl text-transparent leading-tight tracking-normal sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-[#c7d3ea] text-base leading-7 sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="h-10 bg-[#663af3] px-4 text-white hover:bg-[#5930db]"
            >
              <Link to="/">
                <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
                {actionLabel}
              </Link>
            </Button>

            {onRetry ? (
              <Button
                className="h-10 border-[rgba(216,236,248,0.2)] bg-[#070914] px-4 text-[#d1e4fa] hover:bg-[#101328] hover:text-white"
                onClick={onRetry}
                type="button"
                variant="outline"
              >
                <RefreshCcwIcon aria-hidden="true" data-icon="inline-start" />
                Try again
              </Button>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
