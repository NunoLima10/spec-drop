export function createShareUrl(origin: string, slug: string): string {
  return new URL(`/s/${slug}`, origin).toString();
}
