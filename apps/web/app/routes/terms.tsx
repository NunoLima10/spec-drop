import { LegalPage } from "~/components/legal-page";
import type { Route } from "./+types/terms";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Terms of Service | SpecsDrop" },
    {
      name: "description",
      content: "Terms for using the hosted SpecsDrop service.",
    },
  ];
}

export default function Terms() {
  return (
    <LegalPage
      description="These terms govern the public SpecsDrop instance. The open-source code remains licensed under the repository's license."
      title="Terms of Service"
    >
      <section>
        <h2>1. Accepting these terms</h2>
        <p>
          By accessing or using the hosted SpecsDrop service, you agree to these
          terms and the Privacy Policy. If you do not agree, do not use the
          hosted service. If you use SpecsDrop for an organization, you confirm
          that you can accept these terms for that organization.
        </p>
      </section>

      <section>
        <h2>2. What SpecsDrop provides</h2>
        <p>
          SpecsDrop turns Markdown into read-only pages that can be opened by a
          share URL. The hosted service runs on Cloudflare Workers and stores
          share records in Cloudflare D1. Features such as expiry, first-view
          deletion, and view limits are convenience controls, not guarantees of
          secrecy or permanent availability.
        </p>
      </section>

      <section>
        <h2>3. Not a cryptographic or confidential storage service</h2>
        <p>
          SpecsDrop is not an encryption product, cryptographic vault, secrets
          manager, identity system, or access-control service. Markdown is not
          encrypted by SpecsDrop at the application layer. A share slug is a
          public-link identifier, not a password or cryptographic proof. Anyone
          who obtains a live URL may access its content.
        </p>
        <p>
          Do not upload passwords, API keys, private keys, seed phrases,
          recovery codes, authentication tokens, regulated records, or other
          information that requires confidentiality. Use an appropriate
          encrypted and access-controlled system for that material.
        </p>
      </section>

      <section>
        <h2>4. Your content and responsibilities</h2>
        <p>
          You keep ownership of your Markdown. You give the operator a limited,
          worldwide license to host, copy, process, render, transmit, and
          display it only as needed to operate, secure, and maintain the
          service. You are responsible for your content, the people with whom
          you share its URL, and any permissions or notices required before
          uploading it.
        </p>
        <p>
          You must not upload unlawful, infringing, malicious, deceptive, or
          privacy-invasive content. You must not use SpecsDrop to distribute
          malware, phishing material, stolen credentials, personal data without
          authority, or content that violates another person’s rights.
        </p>
      </section>

      <section>
        <h2>5. Acceptable use and security</h2>
        <p>You must not:</p>
        <ul>
          <li>
            probe, scan, exploit, disrupt, overload, or bypass security, rate
            limits, expiry rules, view limits, or deletion controls;
          </li>
          <li>
            access shares without authorization or attempt to enumerate share
            URLs;
          </li>
          <li>
            use automated traffic in a way that degrades the service or imposes
            unreasonable cost; or
          </li>
          <li>
            misrepresent SpecsDrop as providing encryption, confidentiality, or
            guaranteed secure destruction.
          </li>
        </ul>
        <p>
          Good-faith security research must avoid accessing other people’s
          content or degrading the service and should be reported privately to
          the maintainer through the contact route on the project maintainer’s
          website. Do not place sensitive vulnerability details in a public
          issue.
        </p>
      </section>

      <section>
        <h2>6. Deletion, moderation, and availability</h2>
        <p>
          The creator can request deletion through the product controls, and
          configured limits can make a share unavailable. These actions may be
          implemented as logical or soft deletion; residual copies can remain
          temporarily in backups, logs, caches, or provider systems. The
          operator may restrict or remove content, traffic, or access when
          reasonably necessary for abuse prevention, security, legal compliance,
          maintenance, or service protection.
        </p>
        <p>
          The service may change, be suspended, lose data, or be discontinued.
          Keep your own copy of every document. No uptime, retention, recovery,
          or permanent-link guarantee is provided.
        </p>
      </section>

      <section>
        <h2>7. Third-party services</h2>
        <p>
          The hosted instance depends on Cloudflare for application delivery,
          storage, security, rate limiting, and operational telemetry, and may
          use PostHog for limited cookieless audience measurement and product
          events as described in the Privacy Policy. Those providers apply their
          own terms and privacy practices to their services.
        </p>
      </section>

      <section>
        <h2>8. Open source and self-hosting</h2>
        <p>
          The source code is available under the repository’s open-source
          license. That license governs your use of the code; these terms govern
          this hosted instance. If you self-host, you operate a separate service
          and are responsible for your own Cloudflare account, configuration,
          security, data handling, notices, and legal compliance.
        </p>
        <p>
          For maximum control and privacy, we recommend self-hosting SpecsDrop
          in your own Cloudflare account and reviewing, correctly configuring,
          or disabling analytics before deployment. A self-hosted operator is
          responsible for ensuring that its notices match its actual deployment.
        </p>
      </section>

      <section>
        <h2>9. Disclaimers and liability</h2>
        <p>
          To the fullest extent permitted by law, the hosted service is provided
          “as is” and “as available,” without warranties of security,
          confidentiality, fitness, non-infringement, availability, or
          error-free operation. The operator is not liable for indirect,
          incidental, special, consequential, or exemplary loss, or for lost
          content, data, profits, goodwill, or access, arising from use of the
          service.
        </p>
        <p>
          Nothing in these terms excludes a right or liability that applicable
          law does not allow to be excluded.
        </p>
      </section>

      <section>
        <h2>10. Changes and contact</h2>
        <p>
          These terms may be updated as the project changes. The date above
          identifies the current version. Questions and private security or
          legal notices can be sent through the contact route at{" "}
          <a href="https://nunolima.cv/" rel="noreferrer" target="_blank">
            nunolima.cv
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
