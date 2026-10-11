// Single source of truth for the public disclaimer. Used on every public page
// (login, sign-up, pricing, terms, privacy) so the wording never drifts.

export const DISCLAIMER_TEXT =
  'Orbi is a planning and productivity tool. It is not a medical device or health service, ' +
  'and GrimmForged is not a doctor, therapist or certified health professional. ' +
  'Orbi does not diagnose, treat or give medical advice.';

export function Disclaimer({ className = '' }: { className?: string }) {
  return (
    <p
      role="note"
      className={className}
      style={{
        fontSize: '0.78rem',
        lineHeight: 1.5,
        textAlign: 'center',
        opacity: 0.75,
        margin: 0,
      }}
    >
      {DISCLAIMER_TEXT}
    </p>
  );
}
