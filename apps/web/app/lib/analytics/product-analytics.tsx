import { usePostHog } from "@posthog/react";
import { createContext, type ReactNode, useCallback, useContext } from "react";

export const ANALYTICS_EVENT_NAMES = [
  "$pageview",
  "$pageleave",
  "share created",
  "share creation failed",
  "share opened",
  "share link copied",
  "share deleted",
  "markdown copied",
  "markdown downloaded",
] as const;

type AllowedAnalyticsEvent = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AnalyticsEvent = Exclude<
  AllowedAnalyticsEvent,
  "$pageview" | "$pageleave"
>;

type TrackAnalyticsEvent = (event: AnalyticsEvent) => void;

const allowedEventNames = new Set<string>(ANALYTICS_EVENT_NAMES);
const AnalyticsContext = createContext<TrackAnalyticsEvent>(() => undefined);

export function isAllowedAnalyticsEvent(
  eventName: string,
): eventName is AllowedAnalyticsEvent {
  return allowedEventNames.has(eventName);
}

export function AnalyticsBridge({ children }: { children: ReactNode }) {
  const posthog = usePostHog();
  const track = useCallback<TrackAnalyticsEvent>(
    (event) => {
      posthog.capture(event);
    },
    [posthog],
  );

  return (
    <AnalyticsContext.Provider value={track}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
