import {
  ClockIcon,
  EyeIcon,
  InfinityIcon,
  TimerIcon,
  Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";

export function ShareMetadataList({
  createdAt,
  currentViews,
  deleteAfterRead,
  expiresAt,
  maxViews,
  readingTime,
}: {
  createdAt: string;
  currentViews: number;
  deleteAfterRead: boolean;
  expiresAt: string | null;
  maxViews: number | null;
  readingTime: string;
}) {
  return (
    <dl className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
      <MetadataItem
        icon={<ClockIcon aria-hidden="true" className="size-4" />}
        label="Created"
        value={new Date(createdAt).toLocaleString()}
      />
      <MetadataItem
        icon={<TimerIcon aria-hidden="true" className="size-4" />}
        label="Reading time"
        value={readingTime.replace(" read", "")}
      />
      <MetadataItem
        icon={<EyeIcon aria-hidden="true" className="size-4" />}
        label="Views"
        value={`${currentViews}`}
      />
      <MetadataItem
        icon={<InfinityIcon aria-hidden="true" className="size-4" />}
        label="Expires"
        value={expiresAt ? new Date(expiresAt).toLocaleString() : "Never"}
      />
      {maxViews ? (
        <MetadataItem
          icon={<EyeIcon aria-hidden="true" className="size-4" />}
          label="Max views"
          value={`${maxViews} max`}
        />
      ) : null}
      {deleteAfterRead ? (
        <MetadataItem
          icon={<Trash2Icon aria-hidden="true" className="size-4" />}
          label="Delete after read"
          value="Delete after read"
        />
      ) : null}
    </dl>
  );
}

function MetadataItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 text-[#d8ecf8]">
      <dt className="sr-only">{label}</dt>
      <span className="text-[#9da7ba]">{icon}</span>
      <dd>{value}</dd>
    </div>
  );
}
