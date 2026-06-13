import { Button } from '@figma/astraui';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { StepShell } from '../StepShell';
import type { TierId } from '../types';
import { TIERS } from '../types';

interface PaymentStepProps {
  selectedTier: TierId;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 6 (conditional): Payment placeholder for paid tiers */
export function PaymentStep({
  selectedTier,
  onNext,
  onBack,
  totalSteps,
}: PaymentStepProps) {
  const tier = TIERS.find((t) => t.id === selectedTier)!;

  return (
    <StepShell
      step={5}
      totalSteps={totalSteps}
      orbiMessage={`Great choice! The ${tier.name} plan is $${tier.price}/mo. Payment is handled securely — I'll wait right here.`}
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-white font-bold">Payment</h2>
        <p className="text-label-sm text-gray-300">
          Secure checkout for the <strong>{tier.name}</strong> plan — ${tier.price}/month.
        </p>
      </div>

      {/* Placeholder for Stripe / Bambora integration */}
      <div className="rounded-corner-md border border-dashed border-white/20 p-lg flex flex-col items-center gap-md text-center">
        <CreditCard size={32} className="text-gray-400" />
        <p className="text-label-sm text-gray-300">
          Payment integration (Stripe / Bambora) will appear here.
        </p>
        <p className="text-label-sm text-gray-500">
          For now, your account will be created and you can upgrade anytime from Settings.
        </p>
      </div>

      <div className="flex gap-sm">
        <Button variant="neutral" onClick={onBack} className="flex-1">
          <ArrowLeft size={14} />
          Back
        </Button>
        <Button variant="primary" onClick={onNext} className="flex-1">
          Continue
        </Button>
      </div>
    </StepShell>
  );
}
