import { Link } from 'react-router';
import { LegalShell, Section } from './legal/LegalShell';

const LAST_UPDATED = '2026-06-17';

export function TermsPage() {
  return (
    <LegalShell title="Terms of Service" lastUpdated={LAST_UPDATED}>
      <p>
        These Terms of Service ("Terms") govern your access to and use of Orbi, an ADHD
        productivity service provided by GrimmForged AI Solutions ("GrimmForged", "we", "us",
        or "our"). By creating an account or using Orbi, you agree to these Terms.
      </p>

      <Section id="who-we-are" title="1. Who we are">
        <p>
          GrimmForged AI Solutions is a Canadian business located in Nova Scotia, Canada.
          Orbi is a web application designed to help adults with ADHD plan tasks, focus,
          and reflect, with optional AI assistance powered by Anthropic's Claude.
        </p>
      </Section>

      <Section id="eligibility" title="2. Eligibility">
        <p>
          You must be at least 16 years old to use Orbi. Orbi is not directed to children
          under 16, and we do not knowingly collect personal information from anyone under
          that age. If you are using Orbi on behalf of an organization, you represent that
          you have authority to bind that organization to these Terms.
        </p>
      </Section>

      <Section id="accounts" title="3. Your account">
        <p>
          You are responsible for safeguarding your password and for any activity under
          your account. Notify us immediately if you suspect unauthorized access. You agree
          to provide accurate registration information and to keep it current.
        </p>
      </Section>

      <Section id="subscriptions" title="4. Subscriptions and billing">
        <p>
          Orbi offers a free tier and paid subscription tiers ("Orbi Agent" and "Orbi
          Full"). Paid subscriptions are billed in Canadian dollars (CAD) on a recurring
          monthly or annual cycle, depending on the plan you select. The current pricing
          for each tier is displayed at the point of purchase.
        </p>
        <p>
          Payment is processed by Stripe. By starting a paid subscription you authorize us
          (through Stripe) to charge your chosen payment method on each renewal date until
          you cancel. Applicable taxes (HST, GST, or local equivalents) are added at
          checkout and shown before you confirm.
        </p>
        <p>
          We may change subscription pricing at any time. Price changes will take effect at
          the start of your next billing cycle, and we will provide at least 30 days'
          notice before any increase to your renewal price.
        </p>
      </Section>

      <Section id="cancellation" title="5. Cancellation and refunds">
        <p>
          You may cancel your subscription at any time from your Orbi billing portal or by
          contacting us. Cancellation takes effect at the end of the current billing
          period; you retain access to paid features until then.
        </p>
        <p>
          <strong>Refund policy:</strong> Subscription fees are non-refundable except where
          required by applicable consumer protection law. If you believe you have been
          billed in error, contact us within 30 days of the charge and we will review your
          request in good faith.
        </p>
        <p>
          If we materially reduce or terminate the paid features of a tier you are
          subscribed to, we will offer you a pro-rated refund for the unused portion of
          your billing period.
        </p>
      </Section>

      <Section id="ai-disclaimer" title="6. AI features and disclaimer">
        <p>
          Some Orbi features use large language models (currently Anthropic Claude) to
          generate suggestions, break down tasks, and converse with you in the Agent and
          Full tiers. AI-generated content can be inaccurate, incomplete, or out of date.
          <strong> Orbi is not a substitute for professional medical, mental health, legal,
          financial, or therapeutic advice.</strong> ADHD is a medical condition; please
          consult a qualified clinician for diagnosis, treatment, or medication decisions.
        </p>
        <p>
          You should not rely on Orbi for critical decisions, emergencies, or any situation
          in which a wrong answer could cause harm. If you are in crisis or experiencing a
          mental health emergency, contact your local emergency number or a crisis line.
        </p>
      </Section>

      <Section id="acceptable-use" title="7. Acceptable use">
        <p>
          You agree not to:
        </p>
        <ul className="list-disc pl-xl flex flex-col gap-sm">
          <li>Use Orbi for any illegal purpose or in violation of any law;</li>
          <li>Attempt to reverse engineer, scrape, or harvest data from the service;</li>
          <li>Submit content that is unlawful, harassing, abusive, or infringes the rights of others;</li>
          <li>Use the AI features to generate content intended to harm, defraud, or impersonate others;</li>
          <li>Interfere with the operation of the service or attempt to gain unauthorized access to other accounts.</li>
        </ul>
      </Section>

      <Section id="your-content" title="8. Your content">
        <p>
          You retain ownership of the tasks, notes, chat messages, and other content you
          create in Orbi ("Your Content"). You grant us a limited, non-exclusive license to
          host, process, and display Your Content solely for the purpose of providing the
          service to you.
        </p>
        <p>
          We do not use Your Content to train AI models. Conversations with the AI agent
          are sent to Anthropic only to generate the response and are not retained by
          Anthropic for training.
        </p>
      </Section>

      <Section id="termination" title="9. Suspension and termination">
        <p>
          We may suspend or terminate your access to Orbi if you breach these Terms or use
          the service in a way that could harm us, other users, or third parties. Where
          reasonable, we will give you advance notice and an opportunity to cure the
          breach.
        </p>
        <p>
          On termination of your account, your data may be retained for a limited period as
          described in our <Link to="/privacy" className="underline text-brand-primary">Privacy Policy</Link> and then deleted.
        </p>
      </Section>

      <Section id="warranties" title="10. Disclaimer of warranties">
        <p>
          ORBI IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
          WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. We do not
          guarantee uninterrupted, error-free, or perfectly secure operation.
        </p>
      </Section>

      <Section id="liability" title="11. Limitation of liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, GRIMMFORGED AND ITS AFFILIATES SHALL NOT
          BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
          DAMAGES, OR ANY LOSS OF DATA, PROFITS, OR REVENUE, ARISING OUT OF OR IN
          CONNECTION WITH YOUR USE OF ORBI. Our aggregate liability for any claim relating
          to the service will not exceed the greater of (a) the amounts you paid us in the
          twelve months preceding the claim, or (b) one hundred Canadian dollars (CAD $100).
        </p>
      </Section>

      <Section id="indemnity" title="12. Indemnity">
        <p>
          You agree to indemnify and hold harmless GrimmForged from any claims, damages,
          liabilities, costs, and expenses (including reasonable legal fees) arising from
          your misuse of the service, Your Content, or your breach of these Terms.
        </p>
      </Section>

      <Section id="changes" title="13. Changes to these Terms">
        <p>
          We may update these Terms from time to time. If we make material changes we will
          notify you by email or by an in-app notice at least 14 days before the changes
          take effect. Your continued use of Orbi after the effective date constitutes
          acceptance of the updated Terms.
        </p>
      </Section>

      <Section id="governing-law" title="14. Governing law">
        <p>
          These Terms are governed by the laws of the Province of Nova Scotia and the
          federal laws of Canada applicable therein, without regard to conflict-of-law
          principles. The courts of Nova Scotia have exclusive jurisdiction over any
          dispute arising from these Terms, subject to your non-waivable rights as a
          consumer to bring proceedings in your own province or country of residence.
        </p>
      </Section>

      <Section id="contact" title="15. Contact us">
        <p>
          Questions about these Terms? Email us at{' '}
          <a href="mailto:hello@grimmforged.ca" className="underline text-brand-primary">
            hello@grimmforged.ca
          </a>.
        </p>
      </Section>
    </LegalShell>
  );
}
