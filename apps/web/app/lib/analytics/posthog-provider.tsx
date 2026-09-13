import { PostHogProvider } from "@posthog/react";
import type { ReactNode } from "react";
import type { PostHogPublicConfig } from "./posthog-config";
import { AnalyticsBridge, isAllowedAnalyticsEvent } from "./product-analytics";

export function SpecsDropPostHogProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: PostHogPublicConfig | null;
}) {
  if (!config) {
    return children;
  }

  return (
    <PostHogProvider
      apiKey={config.projectToken}
      options={{
        api_host: config.host,
        autocapture: false,
        before_send: (event) =>
          event && isAllowedAnalyticsEvent(event.event) ? event : null,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        capture_pageleave: true,
        capture_pageview: "history_change",
        capture_performance: false,
        cookieless_mode: "always",
        defaults: "2026-05-30",
        disable_session_recording: true,
        disable_surveys: true,
        person_profiles: "never",
        property_denylist: [
          "$current_url",
          "$pathname",
          "$referrer",
          "$referring_domain",
          "$title",
        ],
        respect_dnt: true,
      }}
    >
      <AnalyticsBridge>{children}</AnalyticsBridge>
    </PostHogProvider>
  );
}
