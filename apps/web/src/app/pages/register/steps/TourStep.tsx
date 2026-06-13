import { Button } from '@figma/astraui';
import { Compass, Map, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import { OrbiCharacter } from '../OrbiCharacter';
import type { TourChoice } from '../types';

interface TourStepProps {
  firstName: string;
  onChoose: (choice: TourChoice) => void;
}

const options: { id: TourChoice; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'self-explore',
    label: 'I'll explore on my own',
    desc: 'Jump straight into your dashboard.',
    icon: <Compass size={20} />,
  },
  {
    id: 'quick-tour',
    label: 'Quick tour',
    desc: 'A 30-second overview of the essentials.',
    icon: <Map size={20} />,
  },
  {
    id: 'full-tour',
    label: 'Full guided tour',
    desc: 'Walk through every feature with Orbi.',
    icon: <BookOpen size={20} />,
  },
];

/** Page 8: Post-signup tour prompt */
export function TourStep({ firstName, onChoose }: TourStepProps) {
  return (
    <div className="min-h-screen bg-brand-tertiary flex items-center justify-center px-lg py-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md flex flex-col gap-lg"
      >
        <div className="bg-surface-bg rounded-corner-lg p-xl flex flex-col gap-lg">
          <OrbiCharacter
            message={`Welcome aboard, ${firstName || 'friend'}! 🎉 Your workspace is ready. How would you like to get started?`}
          />

          <div className="flex flex-col gap-xs">
            <h2 className="text-heading text-text-primary text-center">You're in!</h2>
            <p className="text-label-sm text-text-secondary text-center">
              Choose how you'd like to explore Orbi.
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            {options.map((opt, i) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Button
                  variant={i === 0 ? 'primary' : 'neutral'}
                  onClick={() => onChoose(opt.id)}
                  className="w-full justify-start gap-3"
                >
                  {opt.icon}
                  <div className="text-left">
                    <span className="block">{opt.label}</span>
                    <span className="block text-video-title text-text-secondary font-normal">
                      {opt.desc}
                    </span>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
