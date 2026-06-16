import { Button } from '@figma/astraui';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { StepShell } from '../StepShell';
import type { SignupData } from '../types';
import { TIERS } from '../types';

interface FinalizeStepProps {
  data: SignupData;
  loading: boolean;
  error: string | null;
  onSubmit: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 7: Review details and create account */
export function FinalizeStep({
  data,
  loading,
  error,
  onSubmit,
  onBack,
  totalSteps,
}: FinalizeStepProps) {
  const tier = TIERS.find((t) => t.id === data.selectedTier)!;

  return (
    <StepShell
      step={6}
      totalSteps={totalSteps}
      orbiMessage="One last look — if everything's right, let's launch your workspace!"
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-white font-bold">Almost done!</h2>
        <p className="text-label-sm text-gray-300">
          Review your details before creating your account.
        </p>
      </div>

      <div className="flex flex-col gap-sm rounded-corner-md bg-white/5 p-md">
        {[
          { label: 'Name', value: `${data.firstName} ${data.lastName}`.trim() },
          { label: 'Email', value: data.email },
          { label: 'Plan', value: `${tier.icon} ${tier.name}${tier.price > 0 ? ` — $${tier.price}/mo` : ''}` },
        ].map((row) => (
          <div key={row.label} className="flex justify-between items-center">
            <span className="text-label-sm text-gray-400">{row.label}</span>
            <span className="text-label-sm text-white">{row.value}</span>
          </div>
        ))}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-label-sm text-red-400 text-center"
        >
          {error}
        </motion.p>
      )}

      <p className="text-video-title text-gray-500 text-center leading-relaxed">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>

      <div className="flex gap-sm">
        <Button variant="neutral" onClick={onBack} disabled={loading} className="flex-1">
          <ArrowLeft size={14} />
          Back
        </Button>
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={loading}
          className="flex-1"
          iconStart={loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        >
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </div>
    </StepShell>
  );
}
