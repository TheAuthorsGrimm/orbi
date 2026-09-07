import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrbiCharacter } from './OrbiCharacter';
import './register.css';

interface StepShellProps {
  step: number;
  totalSteps: number;
  orbiMessage: string;
  children: ReactNode;
}

export function StepShell({ step, totalSteps, orbiMessage, children }: StepShellProps) {
  return (
    <div className="rg-root">
      <div className="rg-shell-wrap">

        {/* Wordmark */}
        <div className="rg-shell-logo">
          <span className="rg-shell-wordmark">
            <em>O</em>rbi
          </span>
        </div>

        {/* Card */}
        <div className="rg-card">

          {/* Progress segments */}
          <div className="rg-progress" role="progressbar" aria-valuenow={step} aria-valuemax={totalSteps - 1}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`rg-progress-seg${i < step ? ' done' : i === step ? ' active' : ''}`}
              />
            ))}
          </div>

          {/* Orbi guide */}
          <OrbiCharacter message={orbiMessage} />

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(14px, 2vw, 20px)' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
