import { motion } from 'motion/react';
import { Bot } from 'lucide-react';
import './register.css';

interface OrbiMessageProps {
  message: string;
}

export function OrbiCharacter({ message }: OrbiMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="rg-char"
    >
      {/* Square avatar */}
      <div className="rg-char-avatar">
        <Bot size={20} className="text-white" />
      </div>

      {/* Speech bubble */}
      <motion.div
        key={message}
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25 }}
        className="rg-char-bubble"
      >
        {message}
      </motion.div>
    </motion.div>
  );
}
