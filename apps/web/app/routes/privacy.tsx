import { LegalPage } from "~/components/legal-page";
import type { Route } from "./+types/privacy";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Privacy Policy | SpecsDrop" },
    {
      name: "description",
      content: "How the hosted SpecsDrop service handles data.",
    },
  ];
}

export default function Privacy() {
  return (
    <LegalPage
      description="This policy explains what the public SpecsDrop instance stores, what its providers process, and the privacy controls available to you."
      title="Privacy Policy"
    >
      <section>
        <h2>1. Scope</h2>
        <p>
          This policy applies to the public SpecsDrop instance operated by the
          project maintainer. A self-hosted deployment is controlled by its own
          operator and is not covered by this policy. The operator of that
          deployment must provide its own accurate privacy information.
        </p>
      </section>

      <section>
        <h2>2. Information handled by the hosted service</h2>
        <h3>Markdown shares</h3>
        <p>
          When you create a share, SpecsDrop stores the raw Markdown and an
          optional title, plus a random share identifier, creation time, expiry
          choice, delete-after-read setting, optional view limit, view count,
          and timestamps used to apply those controls. No account is required,
          and the app does not intentionally ask for your name or email address.
        </p>

        <h3>Browser-local information</h3>
        <p>
          For non-expiring, non-view-limited shares, the browser can store
          recent share links, titles, activity times, and reading positions in
          local storage. The analytics choice is also stored locally. This
          information stays in that browser unless you share it or browser
          behavior, extensions, or device synchronization copy it elsewhere. You
          can clear it through the app’s history controls or your browser’s
          site-data settings.
        </p>

        <h3>Product analytics</h3>
        <p>
          If PostHog is configured and you choose “Allow analytics,” SpecsDrop
          sends page-view and page-leave events to PostHog. Events can include a
          session identifier and standard technical context such as timestamp,
          browser, operating system, device type, language, and screen or
          viewport size. PostHog or its network providers may also process an IP
          address when receiving a request.
        </p>
        <p>
          Analytics is used only for product analysis: understanding aggregate
          use, finding friction, prioritizing improvements, and measuring
          whether the app works well. SpecsDrop disables autocapture and session
          recording, does not create PostHog person profiles, uses session
          storage for the analytics identifier, respects Do Not Track, and
          excludes page URLs, paths, referrers, referring domains, and page
          titles from event properties. Markdown content, document titles, and
          share slugs must not be sent to PostHog.
        </p>
        <p>
          Declining analytics does not prevent use of SpecsDrop. You can also
          enable Do Not Track in your browser.
        </p>
        <h3>Cloudflare and operational data</h3>
        <p>
          SpecsDrop runs in a Cloudflare account using Workers and D1, with
          Worker observability and rate limiting enabled. Cloudflare processes
          requests and may process network and operational data such as IP
          address, request timing, route or URL, user agent, error information,
          security signals, and system logs. This processing supports delivery,
          reliability, abuse prevention, debugging, and security.
        </p>
      </section>

      <section>
        <h2>3. Public content and no cryptographic confidentiality</h2>
        <p>
          A live share is available to anyone who has or discovers its URL.
          SpecsDrop does not encrypt Markdown at the application layer and is
          not a cryptographic service, secure vault, or secrets manager.
          Transport security supplied by the hosting platform does not make a
          public share private. Do not upload secrets, credentials, private
          keys, seed phrases, regulated records, or other sensitive information.
        </p>
      </section>

      <section>
        <h2>4. Why information is used</h2>
        <ul>
          <li>provide, render, and enforce the settings of Markdown shares;</li>
          <li>operate, secure, debug, and protect the hosted service;</li>
          <li>prevent abuse and enforce rate limits and these Terms; and</li>
          <li>
            with consent, analyze product usage and improve SpecsDrop through
            privacy-limited PostHog events.
          </li>
        </ul>
        <p>
          Where applicable law requires a legal basis, service data is processed
          to provide the feature you request, security and operational data is
          processed for legitimate interests in protecting and maintaining the
          service, and optional PostHog analytics is based on your consent.
        </p>
      </section>

      <section>
        <h2>5. Sharing and processors</h2>
        <p>
          Data is disclosed to Cloudflare as the hosting, database, network,
          security, and observability provider, and to PostHog only when
          optional analytics is enabled and accepted. Information may also be
          disclosed when reasonably necessary to comply with law, protect users
          or the service, investigate abuse, or establish or defend legal
          claims. We do not sell personal information or use it for targeted
          advertising.
        </p>
        <p>
          Provider processing may occur outside your country. Their safeguards,
          locations, and retention practices are governed by their agreements
          and policies. See the{" "}
          <a
            href="https://www.cloudflare.com/privacypolicy/"
            rel="noreferrer"
            target="_blank"
          >
            Cloudflare Privacy Policy
          </a>{" "}
          and the{" "}
          <a
            href="https://posthog.com/privacy"
            rel="noreferrer"
            target="_blank"
          >
            PostHog Privacy Policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2>6. Retention and deletion</h2>
        <p>
          A share remains available until its selected expiry or view rule is
          reached, the creator uses the delete control, or the operator removes
          it. A “never” share has no automatic expiry. The current application
          uses logical deletion, so deletion makes a share unavailable but may
          not immediately remove every database row or residual copy. Provider
          logs, backups, caches, and analytics are retained according to the
          applicable configuration and provider policy, then deleted or
          aggregated when no longer needed.
        </p>
      </section>

      <section>
        <h2>7. Open-source transparency</h2>
        <p>
          The categories and event rules above are documented in the public
          repository alongside the code that emits and configures them. This
          means the collection design is inspectable; it does not mean private
          event records or uploaded Markdown are published as open data. Changes
          to analytics collection should update that public inventory and this
          policy.
        </p>
      </section>

      <section>
        <h2>8. Your choices and rights</h2>
        <p>
          Depending on where you live, you may have rights to access, correct,
          delete, restrict, or object to processing of personal information, or
          withdraw consent. Analytics consent can be declined or revisited
          without losing core functionality. Because SpecsDrop has no accounts,
          the operator may need the exact share URL and other reasonable details
          to locate a record, and may be unable to verify that a requester owns
          a public share.
        </p>
      </section>

      <section>
        <h2>9. Security, children, and changes</h2>
        <p>
          Reasonable technical safeguards are used, but no online service is
          perfectly secure. SpecsDrop is not directed to children and does not
          knowingly seek children’s personal information. This policy may change
          as the project and its providers change; the date above identifies the
          current version.
        </p>
      </section>

      <section>
        <h2>10. Contact</h2>
        <p>
          Privacy questions and rights requests can be sent through the contact
          route at{" "}
          <a href="https://nunolima.cv/" rel="noreferrer" target="_blank">
            nunolima.cv
          </a>
          . Do not include secrets or sensitive document content in a public
          GitHub issue.
        </p>
      </section>
    </LegalPage>
  );
}
