import { motion } from 'motion/react';
import { Bot } from 'lucide-react';
import '../register.css';

interface WelcomeStepProps {
  onNext: () => void;
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  const words = ['Plan.', 'Focus.', 'Thrive.'];

  return (
    <div className="rg-root">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45 }}
        className="rg-welcome"
      >
        {/* Bot avatar — square, gradient */}
        <div className="rg-bot">
          <Bot
            className="text-white"
            style={{ width: 'clamp(2.5rem, 5vw, 4.5rem)', height: 'clamp(2.5rem, 5vw, 4.5rem)' }}
          />
        </div>

        {/* DM Serif Display wordmark */}
        <div className="rg-wordmark">
          <em>O</em>rbi
        </div>

        <p className="rg-welcome-sub">Your ADHD productivity companion</p>

        {/* Tagline words */}
        <div className="rg-words">
          {words.map((word, i) => (
            <motion.span
              key={word}
              className="rg-word"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.25, duration: 0.35, ease: 'easeOut' }}
            >
              {word}
            </motion.span>
          ))}
        </div>

        <motion.p
          className="rg-intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          I'm Orbi — I'll guide you through setting up your account. One step at a time, no rush.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.35 }}
        >
          <button className="rg-start-btn" type="button" onClick={onNext}>
            Let's get started →
          </button>
        </motion.div>

        <motion.p
          className="rg-byline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.1 }}
        >
          by GrimmForged AI Solutions
        </motion.p>
      </motion.div>
    </div>
  );
}
