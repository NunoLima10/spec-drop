import type { DB } from "@specdrop/db";
import { createContext } from "react-router";
import type { PostHogPublicConfig } from "~/lib/analytics/posthog-config";

export const dbContext = createContext<DB | undefined>(undefined);
export const originContext = createContext<string | undefined>(undefined);
export const postHogConfigContext = createContext<PostHogPublicConfig | null>(
  null,
);
