export type PostHogPublicConfig = {
  host: string;
  projectToken: string;
};

export function getPostHogPublicConfig(
  projectToken: string | undefined,
  host: string | undefined,
): PostHogPublicConfig | null {
  const normalizedProjectToken = projectToken?.trim();
  const normalizedHost = host?.trim();

  if (!normalizedProjectToken || !normalizedHost) {
    return null;
  }

  return {
    host: normalizedHost,
    projectToken: normalizedProjectToken,
  };
}
