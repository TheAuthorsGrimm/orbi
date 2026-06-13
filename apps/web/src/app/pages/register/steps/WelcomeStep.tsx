import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';
import { AstraLogo } from '@figma/astraui';
import { Button } from '@figma/astraui';

interface WelcomeStepProps {
  onNext: () => void;
}

/** Page 1: Orbi introduces itself with a fun word animation */
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const words = ['Plan.', 'Focus.', 'Thrive.'];

  return (
    <div className="min-h-screen bg-orbi-dark flex items-center justify-center px-lg py-lg">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md flex flex-col items-center gap-xl text-center"
      >
        {/* Orbi bot character */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="h-24 w-24 rounded-full grid place-items-center shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}
        >
          <Bot size={48} className="text-white" />
        </motion.div>

        {/* Logo */}
        <div className="flex items-center gap-md">
          <AstraLogo size={36} />
          <span
            className="text-title text-white font-bold"
            style={{ fontFamily: 'Instrument Sans, system-ui, sans-serif', fontSize: '2rem' }}
          >
            Orbi
          </span>
        </div>

        <p className="text-label text-gray-300">Your ADHD productivity companion</p>

        {/* Animated tagline words */}
        <div className="flex gap-md justify-center">
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.3, duration: 0.4, ease: 'easeOut' }}
              className="text-heading text-white"
              style={{
                background: 'linear-gradient(135deg, #5250f3, #0d9488)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.5 }}
          className="text-label-sm text-gray-300 max-w-xs"
        >
          I'm Orbi — I'll guide you through setting up your account. One step at a time, no rush.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.4 }}
        >
          <Button variant="primary" onClick={onNext} iconStart={<Sparkles size={16} />}>
            Let's get started
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-video-title text-text-tertiary"
        >
          by GrimmForged AI Solutions
        </motion.p>
      </motion.div>
    </div>
  );
}
