import { motion } from 'motion/react';
import { Bot } from 'lucide-react';

interface OrbiMessageProps {
  message: string;
}

/** The little Orbi bot character that guides users through signup */
export function OrbiCharacter({ message }: OrbiMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex gap-sm items-start"
    >
      {/* Orbi avatar */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="shrink-0 h-12 w-12 rounded-full grid place-items-center"
        style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}
      >
        <Bot size={22} className="text-white" />
      </motion.div>

      {/* Speech bubble */}
      <motion.div
        key={message}
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-corner-md border border-white/20 bg-white/10 p-md flex-1"
      >
        <p className="text-label-sm text-gray-300 leading-relaxed">{message}</p>
      </motion.div>
    </motion.div>
  );
}
