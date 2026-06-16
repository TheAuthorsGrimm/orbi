import { InputField, Button } from '@figma/astraui';
import { ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { StepShell } from '../StepShell';

interface PasswordStepProps {
  password: string;
  onPasswordChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 4: Password creation */
export function PasswordStep({
  password,
  onPasswordChange,
  onNext,
  onBack,
  totalSteps,
}: PasswordStepProps) {
  const checks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
  };
  const isValid = checks.length && checks.letter && checks.number;

  return (
    <StepShell
      step={3}
      totalSteps={totalSteps}
      orbiMessage="Almost there! Create a strong password so your data stays protected."
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-white font-bold">Secure your account</h2>
        <p className="text-label-sm text-gray-300">
          Pick something strong — Orbi will keep it safe.
        </p>
      </div>

      <InputField
        label="Password"
        type="password"
        value={password}
        placeholder="At least 8 characters"
        onChange={onPasswordChange}
      />

      <div className="grid gap-1">
        {[
          { ok: checks.length, text: 'Minimum 8 characters' },
          { ok: checks.letter, text: 'Includes a letter' },
          { ok: checks.number, text: 'Includes a number' },
        ].map((c) => (
          <p
            key={c.text}
            className={`text-label-sm ${c.ok ? 'text-emerald-400' : 'text-gray-400'}`}
          >
            <CheckCircle2 size={12} className="inline mr-1" />
            {c.text}
          </p>
        ))}
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
