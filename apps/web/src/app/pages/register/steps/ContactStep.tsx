import { InputField, Button } from '@figma/astraui';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { StepShell } from '../StepShell';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface ContactStepProps {
  email: string;
  onEmailChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 3: Email address */
export function ContactStep({
  email,
  onEmailChange,
  onNext,
  onBack,
  totalSteps,
}: ContactStepProps) {
  const isValid = EMAIL_PATTERN.test(email.trim());

  return (
    <StepShell
      step={2}
      totalSteps={totalSteps}
      orbiMessage="Add your email so your workspace stays secure and connected to your account."
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-text-primary">Contact info</h2>
        <p className="text-label-sm text-text-secondary">
          We'll use this for your account — no spam, ever.
        </p>
      </div>

      <InputField
        label="Email address"
        type="email"
        value={email}
        placeholder="you@example.com"
        onChange={onEmailChange}
      />

      <div className="flex gap-sm">
        <Button variant="neutral" onClick={onBack} className="flex-1">
          <ArrowLeft size={14} />
          Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!isValid} className="flex-1">
          Next
          <ArrowRight size={14} />
        </Button>
      </div>
    </StepShell>
  );
}
