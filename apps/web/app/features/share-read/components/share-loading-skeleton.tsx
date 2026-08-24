export function ShareLoadingSkeleton() {
  return (
    <main
      aria-busy="true"
      className="relative min-h-screen overflow-hidden bg-[#05060f] text-white"
    >
      <span className="sr-only">Loading shared Markdown</span>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(186,215,247,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(186,215,247,0.05)_1px,transparent_1px)] bg-[size:84px_84px] [mask-image:radial-gradient(circle_at_top,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-[-18rem] mx-auto h-[34rem] max-w-5xl bg-[conic-gradient(from_180deg_at_50%_45%,transparent_0deg,rgba(124,145,182,0.42)_22deg,transparent_52deg)] blur-2xl" />

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <section className="min-w-0 max-w-3xl">
            <div className="mb-6 animate-pulse pb-4">
              <div className="mb-4 h-3 w-32 rounded-full bg-[#2b3551]" />
              <div className="space-y-3">
                <div className="h-10 w-full max-w-2xl rounded-lg bg-[#d8ecf8]/18 sm:h-12" />
                <div className="h-10 w-4/5 rounded-lg bg-[#d8ecf8]/14 sm:h-12" />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <div className="h-4 w-28 rounded-full bg-[#2b3551]" />
                <div className="h-4 w-24 rounded-full bg-[#2b3551]" />
                <div className="h-4 w-16 rounded-full bg-[#2b3551]" />
              </div>

              <div className="mt-5 flex items-center gap-2">
                <div className="h-10 w-40 rounded-lg border border-white/10 bg-[#101426]" />
                <div className="size-10 rounded-lg border border-white/10 bg-[#101426]" />
                <div className="size-10 rounded-lg border border-white/10 bg-[#101426]" />
              </div>
            </div>

            <div className="animate-pulse space-y-5">
              <div className="h-5 w-3/4 rounded-full bg-[#d8ecf8]/16" />
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 w-11/12 rounded-full bg-[#263250]" />
              </div>
              <div className="h-52 rounded-lg border border-[rgba(216,236,248,0.1)] bg-[#090d1a]/80" />
              <div className="space-y-3">
                <div className="h-4 rounded-full bg-[#263250]" />
                <div className="h-4 w-5/6 rounded-full bg-[#263250]" />
                <div className="h-4 w-2/3 rounded-full bg-[#263250]" />
              </div>
            </div>
          </section>

          <aside className="hidden lg:block">
            <div className="sticky top-10 animate-pulse border-[rgba(216,236,248,0.16)] border-l pl-5">
              <div className="mb-4 h-4 w-20 rounded-full bg-[#d8ecf8]/16" />
              <div className="space-y-3">
                <div className="h-3 w-32 rounded-full bg-[#263250]" />
                <div className="h-3 w-40 rounded-full bg-[#263250]" />
                <div className="h-3 w-28 rounded-full bg-[#263250]" />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
