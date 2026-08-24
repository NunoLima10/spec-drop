import { Code2Icon, EyeIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { PreviewMode } from "../types";

export function PreviewToggle({
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
