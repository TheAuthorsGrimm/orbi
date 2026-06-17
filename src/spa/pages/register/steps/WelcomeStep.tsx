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
    <div className="min-h-screen bg-orbi-dark flex items-center justify-center px-[clamp(1rem,4vw,4rem)] py-[clamp(1rem,4vw,4rem)]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full flex flex-col items-center text-center"
        style={{
          maxWidth: 'min(90vw, 56rem)',
          gap: 'clamp(1.25rem, 3vw, 2.5rem)',
        }}
      >
        {/* Orbi bot character */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="rounded-full grid place-items-center shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #5250f3, #0d9488)',
            width: 'clamp(6rem, 12vw, 12rem)',
            height: 'clamp(6rem, 12vw, 12rem)',
          }}
        >
          <Bot
            className="text-white"
            style={{ width: 'clamp(3rem, 6vw, 6rem)', height: 'clamp(3rem, 6vw, 6rem)' }}
          />
        </motion.div>

        {/* Logo */}
        <div className="flex items-center" style={{ gap: 'clamp(0.5rem, 1.5vw, 1.25rem)' }}>
          <AstraLogo size={36} />
          <span
            className="text-white font-bold"
            style={{
              fontFamily: 'Instrument Sans, system-ui, sans-serif',
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              lineHeight: 1,
            }}
          >
            Orbi
          </span>
        </div>

        <p
          className="text-gray-300"
          style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}
        >
          Your ADHD productivity companion
        </p>

        {/* Animated tagline words */}
        <div className="flex justify-center" style={{ gap: 'clamp(0.5rem, 2vw, 2rem)' }}>
          {words.map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.3, duration: 0.4, ease: 'easeOut' }}
              className="text-white font-bold"
              style={{
                background: 'linear-gradient(135deg, #5250f3, #0d9488)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 'clamp(1.75rem, 5vw, 4rem)',
                lineHeight: 1.1,
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
          className="text-gray-300"
          style={{
            fontSize: 'clamp(0.95rem, 1.6vw, 1.25rem)',
            maxWidth: 'min(90vw, 36rem)',
            lineHeight: 1.5,
          }}
        >
          I'm Orbi — I'll guide you through setting up your account. One step at a time, no rush.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.4 }}
          style={{ transform: 'scale(clamp(1, calc(1 + (100vw - 768px) / 4000), 1.5))', transformOrigin: 'center' }}
        >
          <Button variant="primary" onClick={onNext} iconStart={<Sparkles size={16} />}>
            Let's get started
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-text-tertiary"
          style={{ fontSize: 'clamp(0.75rem, 1.1vw, 1rem)' }}
        >
          by GrimmForged AI Solutions
        </motion.p>
      </motion.div>
    </div>
  );
}
