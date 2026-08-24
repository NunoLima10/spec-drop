export function getReadingProgress({
  scrollHeight,
  scrollY,
  viewportHeight,
}: {
  scrollHeight: number;
  scrollY: number;
  viewportHeight: number;
}) {
  const scrollable = scrollHeight - viewportHeight;

  if (scrollable <= 0) {
    return 100;
  }

  return Math.min(100, Math.max(0, (scrollY / scrollable) * 100));
}
