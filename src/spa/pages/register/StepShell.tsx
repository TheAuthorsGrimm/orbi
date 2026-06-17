import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AstraLogo } from '@figma/astraui';
import { Sparkles } from 'lucide-react';
import { OrbiCharacter } from './OrbiCharacter';

interface StepShellProps {
  step: number;
  totalSteps: number;
  orbiMessage: string;
  children: ReactNode;
}

/** Consistent shell wrapping every signup step: logo, Orbi, progress, content */
export function StepShell({ step, totalSteps, orbiMessage, children }: StepShellProps) {
  return (
    <div className="min-h-screen bg-orbi-dark flex items-center justify-center px-[clamp(1rem,4vw,4rem)] py-[clamp(1rem,4vw,4rem)]">
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 'min(92vw, 48rem)',
          gap: 'clamp(1rem, 2.5vw, 2rem)',
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-xs">
          <div className="flex items-center gap-md">
            <AstraLogo size={32} />
            <span
              className="text-title text-white font-bold"
              style={{ fontFamily: 'Instrument Sans, system-ui, sans-serif' }}
            >
              Orbi
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <Sparkles size={10} className="text-brand-primary" />
            <span className="text-video-title text-gray-400">by GrimmForged AI Solutions</span>
          </div>
        </div>

        {/* Card */}
        <div className="w-full bg-orbi-surface rounded-corner-lg p-xl flex flex-col gap-lg border border-orbi-border">
          {/* Orbi character */}
          <OrbiCharacter message={orbiMessage} />

          {/* Progress dots */}
          <div className="flex items-center gap-xs justify-center">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full transition-all duration-300"
                style={{
                  background:
                    i < step
                      ? 'linear-gradient(135deg, #5250f3, #0d9488)'
                      : i === step
                        ? '#5250f3'
                        : 'rgba(255,255,255,0.3)',
                  transform: i === step ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>

          {/* Step content with enter/exit animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col gap-lg"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
