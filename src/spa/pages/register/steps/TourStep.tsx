import { Compass, Map, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { OrbiCharacter } from '../OrbiCharacter';
import type { TourChoice } from '../types';
import '../register.css';

interface TourStepProps {
  firstName: string;
  onChoose: (choice: TourChoice) => void;
}

const options: { id: TourChoice; label: string; desc: string; icon: React.ReactNode }[] = [
  { id: 'self-explore', label: "I'll explore on my own", desc: 'Jump straight into your dashboard.', icon: <Compass size={20} /> },
  { id: 'quick-tour',   label: 'Quick tour',             desc: 'A 30-second overview of the essentials.', icon: <Map size={20} /> },
  { id: 'full-tour',    label: 'Full guided tour',        desc: 'Walk through every feature with Orbi.', icon: <BookOpen size={20} /> },
];

export function TourStep({ firstName, onChoose }: TourStepProps) {
  return (
    <div className="rg-root">
      <div className="rg-shell-wrap" style={{ maxWidth: 'min(92vw, 42rem)' }}>

        <div className="rg-shell-logo">
          <span className="rg-shell-wordmark"><em>O</em>rbi</span>
        </div>

        <motion.div
          className="rg-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <OrbiCharacter
            message={`Welcome aboard, ${firstName || 'friend'}! Your workspace is ready. How would you like to get started?`}
          />

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--orbi-display-family, "DM Serif Display", Georgia, serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 400, color: 'var(--orbi-text)', marginBottom: 6 }}>
              You're in.
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--orbi-text-muted)' }}>
              Choose how you'd like to explore Orbi.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map((opt, i) => (
              <motion.button
                key={opt.id}
                className={`rg-btn ${i === 0 ? 'rg-btn-primary' : 'rg-btn-neutral'}`}
                style={{ justifyContent: 'flex-start', gap: 12 }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                type="button"
                onClick={() => onChoose(opt.id)}
              >
                {opt.icon}
                <span style={{ textAlign: 'left' }}>
                  <span style={{ display: 'block' }}>{opt.label}</span>
                  <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 400, opacity: 0.7 }}>{opt.desc}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
