import { HistoryIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ShareHistoryItem } from "~/features/shares/share-history";

export function ShareHistoryList({
  items,
  onClear,
  onRemove,
}: {
  items: ShareHistoryItem[];
  onClear: () => void;
  onRemove: (slug: string) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <section
      aria-labelledby="share-history-title"
      className="mt-8 w-full max-w-5xl"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          className="inline-flex items-center gap-2 font-medium text-[#d8ecf8] text-sm uppercase tracking-normal"
          id="share-history-title"
        >
          <HistoryIcon aria-hidden="true" className="size-4" />
          Local storage history
        </h2>
        <Button
          className="h-8 border-[rgba(216,236,248,0.16)] bg-[#070914]/80 px-2.5 text-[#9da7ba] hover:bg-[#101328] hover:text-white"
          onClick={onClear}
          size="sm"
          type="button"
          variant="outline"
        >
          <Trash2Icon aria-hidden="true" data-icon="inline-start" />
          Clear all
        </Button>
      </div>

      <ol className="grid gap-2">
        {items.map((item) => (
          <li
            className="flex min-w-0 items-center gap-3 rounded-lg border border-[rgba(216,236,248,0.14)] bg-[#070914]/84 px-3 py-2 shadow-[inset_0_1px_1px_rgba(199,211,234,0.08)]"
            key={item.slug}
          >
            <a
              className="min-w-0 flex-1 py-1 text-[#d1e4fa] hover:text-white"
              href={item.url}
            >
              <span className="block truncate font-medium text-sm">
                {item.title}
              </span>
              <span className="mt-0.5 block truncate text-[#9da7ba] text-xs">
                {getShareHistoryPath(item.url)} -{" "}
                {new Date(item.updatedAt).toLocaleString()}
              </span>
            </a>
            <Button
              aria-label={`Remove ${item.title} from history`}
              className="size-8 border-[rgba(216,236,248,0.16)] bg-transparent p-0 text-[#9da7ba] hover:bg-white/10 hover:text-white"
              onClick={() => onRemove(item.slug)}
              title="Remove"
              type="button"
              variant="outline"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </Button>
          </li>
        ))}
      </ol>
    </section>
  );
}

function getShareHistoryPath(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}
