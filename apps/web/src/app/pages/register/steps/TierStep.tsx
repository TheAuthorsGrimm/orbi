import { useState } from 'react';
import { Button } from '@figma/astraui';
import { ArrowRight, ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { StepShell } from '../StepShell';
import { TIERS, type TierId } from '../types';

interface TierStepProps {
  selectedTier: TierId;
  onSelectTier: (tier: TierId) => void;
  onNext: () => void;
  onBack: () => void;
  totalSteps: number;
}

/** Page 5: Pricing tier selection with icons linking to tier details */
export function TierStep({
  selectedTier,
  onSelectTier,
  onNext,
  onBack,
  totalSteps,
}: TierStepProps) {
  const [expandedTier, setExpandedTier] = useState<TierId | null>(null);

  return (
    <StepShell
      step={4}
      totalSteps={totalSteps}
      orbiMessage="Pick the version that works for you — you can always change later. No pressure!"
    >
      <div className="flex flex-col gap-xs">
        <h2 className="text-heading text-text-primary">Choose your plan</h2>
        <p className="text-label-sm text-text-secondary">
          Start free or unlock AI features. Tap a plan to see what's included.
        </p>
      </div>

      <div className="flex flex-col gap-sm">
        {TIERS.map((tier, i) => {
          const selected = selectedTier === tier.id;
          const expanded = expandedTier === tier.id;

          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              type="button"
              onClick={() => onSelectTier(tier.id)}
              className="w-full text-left rounded-corner-md p-md transition-all"
              style={{
                border: selected
                  ? `2px solid ${tier.color}`
                  : '1px solid rgba(255,255,255,0.1)',
                background: selected
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex items-center gap-sm">
                <span className="text-xl">{tier.icon}</span>
                <div className="flex-1">
                  <p className="text-label text-text-primary">{tier.name}</p>
                  <p className="text-label-sm text-text-secondary">{tier.tagline}</p>
                </div>
                <div className="flex items-center gap-xs">
                  <span className="text-label text-text-primary">
                    {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
                  </span>
                  {selected && (
                    <div
                      className="h-5 w-5 rounded-full grid place-items-center"
                      style={{ background: tier.color }}
                    >
                      <Check size={12} className="text-black" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedTier(expanded ? null : tier.id);
                }}
                className="mt-2 text-label-sm flex items-center gap-1"
                style={{ color: tier.color }}
              >
                <ExternalLink size={10} />
                {expanded ? 'Hide details' : 'View features'}
              </button>

              {/* Expanded feature list */}
              {expanded && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 flex flex-col gap-1 pl-7"
                >
                  {tier.features.map((f) => (
                    <li key={f} className="text-label-sm text-text-secondary flex items-center gap-1">
                      <Check size={10} style={{ color: tier.color }} />
                      {f}
                    </li>
                  ))}
                </motion.ul>
              )}
            </motion.button>
          );
        })}
      </div>

      <div className="flex gap-sm">
        <Button variant="neutral" onClick={onBack} className="flex-1">
          <ArrowLeft size={14} />
          Back
        </Button>
        <Button variant="primary" onClick={onNext} className="flex-1">
          Next
          <ArrowRight size={14} />
        </Button>
      </div>
    </StepShell>
  );
}
