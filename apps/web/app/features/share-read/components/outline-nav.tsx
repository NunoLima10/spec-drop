import type { MarkdownOutlineItem } from "~/lib/markdown/plugins";

export function outlinesAreEqual(
  currentItems: MarkdownOutlineItem[],
  nextItems: MarkdownOutlineItem[],
) {
  if (currentItems.length !== nextItems.length) {
    return false;
  }

  return currentItems.every((item, index) => {
    const nextItem = nextItems[index];

    return (
      nextItem !== undefined &&
      item.id === nextItem.id &&
      item.text === nextItem.text &&
      item.depth === nextItem.depth
    );
  });
}

export function OutlineNav({ outline }: { outline: MarkdownOutlineItem[] }) {
  return (
    <nav aria-label="Table of contents">
      <ol className="flex flex-col gap-2 pt-3 text-sm lg:pt-0">
        {outline.map((item) => (
          <li key={item.id}>
            <a
              className="block text-[#9da7ba] hover:text-[#d8ecf8]"
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
