import { InputField, Button } from '@figma/astraui';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { StepShell } from '../StepShell';

interface NameStepProps {
  firstName: string;
  lastName: string;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 2: First Name and Last Name — one clean form */
export function NameStep({
  firstName,
  lastName,
  onFirstNameChange,
  onLastNameChange,
  onNext,
  onBack,
  totalSteps,
}: NameStepProps) {
  const isValid = firstName.trim().length >= 2;

  return (
    <StepShell
      step={1}
      totalSteps={totalSteps}
      orbiMessage={
        firstName.trim()
          ? `Nice to meet you, ${firstName.trim()}! What's your last name?`
          : 'Let's start with your name — I'll use it to personalize your experience.'
      }
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-text-primary">What's your name?</h2>
        <p className="text-label-sm text-text-secondary">
          Just so Orbi knows what to call you.
        </p>
      </div>

      <div className="flex flex-col gap-md">
        <InputField
          label="First name"
          value={firstName}
          placeholder="Your first name"
          onChange={onFirstNameChange}
        />
        <InputField
          label="Last name"
          value={lastName}
          placeholder="Your last name (optional)"
          onChange={onLastNameChange}
        />
      </div>

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
