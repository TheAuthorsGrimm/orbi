import { Link } from 'react-router';
import { LegalShell, Section } from './legal/LegalShell';

const LAST_UPDATED = '2026-06-17';

export function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated={LAST_UPDATED}>
      <p>
        GrimmForged AI Solutions ("GrimmForged", "we", "us") operates Orbi, an ADHD
        productivity service. This Privacy Policy explains what personal information we
        collect, how we use it, who we share it with, and the rights you have under
        Canadian privacy law (PIPEDA) and other applicable laws.
      </p>

      <Section id="what-we-collect" title="1. Information we collect">
        <p>We collect three categories of information:</p>
        <ul className="list-disc pl-xl flex flex-col gap-sm">
          <li>
            <strong>Account information</strong> you provide directly: email address,
            display name, password (stored only as a salted bcrypt hash), and optional
            profile preferences.
          </li>
          <li>
            <strong>Service content</strong> you create in Orbi: tasks, notes, focus
            session records, reminders, chat conversations with the AI agent, and any other
            content you choose to enter.
          </li>
          <li>
            <strong>Technical and usage data</strong> automatically collected when you use
            Orbi: IP address, browser type, device type, pages visited, timestamps, and
            error logs. This is used for security, debugging, and aggregate analytics.
          </li>
        </ul>
        <p>
          If you subscribe to a paid plan, our payment processor (Stripe) collects your
          billing information directly. We never see or store full credit card numbers; we
          only receive a customer ID, the last four digits, and metadata needed to manage
          your subscription.
        </p>
      </Section>

      <Section id="why-we-collect" title="2. Why we collect it">
        <ul className="list-disc pl-xl flex flex-col gap-sm">
          <li>To provide and operate the Orbi service for you;</li>
          <li>To authenticate your account and keep it secure;</li>
          <li>To process subscription payments and send receipts;</li>
          <li>To respond to your support requests;</li>
          <li>To detect and prevent fraud, abuse, and security incidents;</li>
          <li>To improve Orbi (in aggregate, non-identifying form);</li>
          <li>To comply with legal obligations.</li>
        </ul>
        <p>
          We rely on your consent (provided when you create an account and agree to these
          terms) and on the legitimate interest of operating the service for these purposes.
        </p>
      </Section>

      <Section id="processors" title="3. Third-party service providers">
        <p>
          Orbi is built on top of several trusted providers. Each one processes a defined
          slice of your information strictly to deliver their part of the service.
        </p>
        <ul className="list-disc pl-xl flex flex-col gap-sm">
          <li>
            <strong>Vercel Inc.</strong> (United States) — hosts the application and serves
            it to your browser.
          </li>
          <li>
            <strong>Neon</strong> (United States) — managed Postgres database where account
            and service content is stored.
          </li>
          <li>
            <strong>Stripe, Inc.</strong> (United States) — processes subscription payments
            and stores billing information.
          </li>
          <li>
            <strong>Anthropic, PBC</strong> (United States) — provides the Claude language
            model used in AI chat and task-breakdown features. Conversations are sent to
            Anthropic only for the duration of the request and are not used to train their
            models when accessed through their API.
          </li>
        </ul>
        <p>
          We do not sell your personal information to anyone. We may disclose information
          to law enforcement or government bodies if compelled by a valid Canadian legal
          process.
        </p>
      </Section>

      <Section id="where-stored" title="4. Where your data is stored">
        <p>
          Account information and service content are stored in Neon's hosted Postgres
          infrastructure in the United States. Backups may be replicated to additional
          regions within the same provider. Because data is transferred outside of Canada,
          it may be subject to U.S. legal process. By using Orbi you consent to this
          transfer.
        </p>
      </Section>

      <Section id="cookies" title="5. Cookies and tracking">
        <p>
          We use a single first-party session cookie (<code>orbi_session</code>) to keep
          you signed in. It is HTTP-only and Secure. We do not use third-party advertising
          cookies or cross-site trackers.
        </p>
        <p>
          If we add analytics in the future (for example, to understand which features are
          most used), we will update this policy first and use a privacy-respecting
          provider that does not require cookie banners.
        </p>
      </Section>

      <Section id="retention" title="6. How long we keep your data">
        <p>
          We retain your account and content while your account is active. If you delete
          your account, we delete your personal information within 30 days, except where we
          are legally required to keep some records (for example, billing records required
          for tax purposes are retained for the period mandated by the Canada Revenue
          Agency).
        </p>
      </Section>

      <Section id="security" title="7. How we protect your data">
        <p>
          We follow industry best practices to protect your information: TLS encryption in
          transit, encryption at rest in the database, hashed passwords (bcrypt with a
          per-user salt), and least-privilege access for our team. No system is perfectly
          secure, but we take reasonable measures to reduce risk and will notify affected
          users without undue delay if a breach is detected.
        </p>
      </Section>

      <Section id="your-rights" title="8. Your rights">
        <p>Under PIPEDA and applicable provincial privacy laws, you have the right to:</p>
        <ul className="list-disc pl-xl flex flex-col gap-sm">
          <li><strong>Access</strong> the personal information we hold about you;</li>
          <li><strong>Correct</strong> any inaccurate information;</li>
          <li><strong>Withdraw consent</strong> for future processing (note: this may mean we can no longer provide the service);</li>
          <li><strong>Request deletion</strong> of your account and personal information;</li>
          <li><strong>Export</strong> a copy of your data;</li>
          <li><strong>File a complaint</strong> with the Office of the Privacy Commissioner of Canada (
            <a href="https://www.priv.gc.ca" className="underline text-brand-primary" target="_blank" rel="noreferrer">
              priv.gc.ca
            </a>
            ) if you believe we have not handled your information appropriately.
          </li>
        </ul>
        <p>
          To exercise any of these rights, email{' '}
          <a href="mailto:privacy@grimmforged.ca" className="underline text-brand-primary">
            privacy@grimmforged.ca
          </a>
          . We will respond within 30 days.
        </p>
      </Section>

      <Section id="children" title="9. Children">
        <p>
          Orbi is not directed to children under 16. We do not knowingly collect personal
          information from children under 16. If you believe we have done so, please
          contact us and we will delete the information promptly.
        </p>
      </Section>

      <Section id="quebec" title="10. Quebec residents (Law 25)">
        <p>
          If you live in Quebec, Quebec's Act respecting the protection of personal
          information in the private sector ("Law 25") may give you additional rights,
          including the right to data portability and stricter requirements around
          automated decision-making. You may contact our privacy officer at the address
          below for questions specific to Law 25 rights.
        </p>
      </Section>

      <Section id="changes" title="11. Changes to this policy">
        <p>
          If we make material changes to this Privacy Policy, we will notify you by email
          or in-app at least 14 days before the changes take effect. The "Last updated"
          date at the top of this page reflects the most recent revision.
        </p>
      </Section>

      <Section id="contact" title="12. Contact our privacy officer">
        <p>
          Questions, requests, or concerns about your privacy? Reach our Privacy Officer at{' '}
          <a href="mailto:privacy@grimmforged.ca" className="underline text-brand-primary">
            privacy@grimmforged.ca
          </a>
          . Mailing address: GrimmForged AI Solutions, Nova Scotia, Canada.
        </p>
        <p>
          See also our <Link to="/terms" className="underline text-brand-primary">Terms of Service</Link>.
        </p>
      </Section>
    </LegalShell>
  );
}
