# Analytics and telemetry

SpecsDrop keeps hosted product analytics narrow and publicly inspectable. This
file is the source-of-truth inventory for analytics events. Changes to collection
must update this inventory and the Privacy Policy.

## Purpose

Analytics should answer a small set of product questions:

- How many browsers use SpecsDrop on a typical day?
- How often do visitors complete the core create-share-open workflow?
- Which core sharing actions are useful?
- Where does share creation fail?

Analytics is not intended to identify people, build durable user profiles,
inspect document contents, or track a browser across days.

## Configuration and identity

- Analytics is off unless both `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` are
  configured by the operator.
- The PostHog project must have **Cookieless server hash mode** enabled and
  stored IP capture disabled before these variables are configured.
- When configured, the browser SDK uses `cookieless_mode: "always"`. It does not
  store PostHog data in cookies, local storage, or session storage and does not
  show an analytics consent banner.
- PostHog calculates a daily identifier on its servers from the project, a
  rotating daily salt, request IP address, user agent, and hostname. The salt is
  changed and deleted daily, and the IP address must not be retained as an event
  property.
- Because the identifier changes daily, daily unique-browser counts are
  estimates. Weekly or monthly unique counts can be inflated, and cross-day
  retention or returning-user identification is deliberately unavailable.
- Browser Do Not Track is respected where the browser still supplies the signal.

## Current PostHog events

| Event | Trigger | Product purpose |
| --- | --- | --- |
| `$pageview` | A visitor loads or navigates to a page | Estimate aggregate visits |
| `$pageleave` | A visitor leaves a page | Estimate aggregate engagement |
| `share created` | The API confirms creation | Measure completed publishing |
| `share creation failed` | Client validation or the create request fails | Find publishing friction without sending error details |
| `share opened` | The API returns an available share | Measure successful reads |
| `share link copied` | The generated share URL is copied successfully | Measure completed handoff intent |
| `share deleted` | The API confirms creator deletion | Measure deletion-control use |
| `markdown copied` | Rendered Markdown is copied successfully | Measure document reuse |
| `markdown downloaded` | The browser starts a Markdown download | Measure document reuse |

Custom events contain only the typed event name. SpecsDrop does not attach custom
properties to them.

The browser integration contains a final event-name allowlist. Any event not in
this table is rejected before it is sent. New events require an explicit code,
inventory, and Privacy Policy update.

PostHog can attach standard SDK context such as event time, browser, operating
system, device type, language, and screen or viewport size. Its server processes
the request IP address and user agent to calculate the daily cookieless hash.

## Collection boundaries

The browser SDK is configured with:

- autocapture disabled;
- session recording disabled;
- person profiles and identification disabled;
- cookies, local-storage persistence, and session-storage persistence disabled
  through always-cookieless mode;
- surveys, heatmaps, performance capture, dead-click capture, and exception
  capture disabled;
- Do Not Track support;
- an event-name allowlist; and
- a property denylist covering current URL, path, referrer, referring domain,
  and page title.

Analytics events must never contain:

- Markdown content or excerpts;
- document titles or filenames;
- share slugs, URLs, deletion state, or deletion credentials;
- passwords, tokens, private keys, seed phrases, or other secrets;
- raw form, clipboard, or error-message contents; or
- a deliberately collected name, email address, account identity, or persistent
  device identifier.

## Accuracy limits

The analytics are directional rather than an exact census. Browser script
blocking, disabled JavaScript, network failures, daily identifier rotation, and
shared network or browser characteristics can cause undercounting, overcounting,
or collisions. Cloudflare request and Web Analytics metrics can be used as a
separate traffic baseline, but they should not be treated as an exact count of
people either.

## Operational telemetry

The hosted instance uses Cloudflare Workers, D1, rate limiting, and Worker
observability. Cloudflare may process network and operational data necessary to
deliver and protect the service, including IP addresses, request timing, routes
or URLs, user agents, errors, security signals, and system logs. This telemetry
is separate from the limited PostHog product analytics described above.

Self-hosted operators control their own Cloudflare and analytics configuration
and must publish privacy information that matches their deployment.
