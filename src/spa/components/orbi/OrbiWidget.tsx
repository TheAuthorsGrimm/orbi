import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, Send, ArrowUpRight, Zap } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '@/spa/context/AuthContext';
import { OrbiTier } from '@/spa/types';

const FREE_DAILY_LIMIT = 5;

// Pages where the widget should be hidden (full-screen Orbi is already there)
const HIDDEN_PATHS = new Set(['/agent', '/login', '/register', '/onboarding']);

export function OrbiWidget() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sending, sendMessage, limitReached, messagesUsedToday } = useChat();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Don't render on hidden paths
  if (HIDDEN_PATHS.has(location.pathname)) return null;

  const isFree = (user?.tier ?? OrbiTier.FREE) === OrbiTier.FREE;
  const messagesLeft = Math.max(0, FREE_DAILY_LIMIT - messagesUsedToday);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  // Focus input when widget opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || sending || limitReached) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed z-50"
      style={{ bottom: 24, right: 24 }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="absolute bottom-16 right-0 flex flex-col"
            style={{
              width: 340,
              height: 440,
              background: 'var(--orbi-surface)',
              border: '1px solid color-mix(in srgb, var(--orbi-primary) 35%, transparent)',
              boxShadow: '0 8px 48px color-mix(in srgb, var(--orbi-primary) 20%, transparent), 0 2px 12px rgba(0,0,0,0.3)',
              borderRadius: 'var(--radius-lg, 12px)',
              overflow: 'hidden',
            }}
          >
            {/* Widget header */}
            <div
              className="flex items-center gap-md px-lg py-md flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--orbi-primary) 20%, var(--orbi-surface)), color-mix(in srgb, var(--orbi-secondary) 12%, var(--orbi-surface)))',
                borderBottom: '1px solid color-mix(in srgb, var(--orbi-primary) 20%, transparent)',
              }}
            >
              <div
                className="flex items-center justify-center rounded-full flex-shrink-0"
                style={{
                  width: 32, height: 32,
                  background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
                }}
              >
                <Bot size={15} className="text-white" />
              </div>
              <div className="flex flex-col gap-xs flex-1 min-w-0">
                <span className="text-label text-text-primary">Orbi</span>
                {isFree && (
                  <span className="text-video-title" style={{ color: messagesLeft <= 1 ? 'var(--status-danger)' : 'var(--orbi-primary)' }}>
                    {limitReached ? 'Daily limit reached' : `${messagesLeft} of ${FREE_DAILY_LIMIT} messages left today`}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-sm">
                <button
                  onClick={() => { setOpen(false); navigate('/agent'); }}
                  className="flex items-center justify-center rounded-corner-md transition-all"
                  style={{ width: 28, height: 28, color: 'var(--orbi-text-muted)' }}
                  title="Open full Orbi"
                >
                  <ArrowUpRight size={14} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-corner-md transition-all"
                  style={{ width: 28, height: 28, color: 'var(--orbi-text-muted)' }}
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-lg py-md flex flex-col gap-md">
              {messages.length === 0 && (
                <div className="flex flex-col gap-sm mt-md">
                  <p className="text-label-sm text-text-secondary text-center">
                    👋 Hi! I'm Orbi, your ADHD companion.
                  </p>
                  <p className="text-video-title text-text-tertiary text-center">
                    Ask me anything — tasks, focus, planning, or just to vent.
                  </p>
                  {isFree && (
                    <button
                      className="mt-sm flex items-center justify-center gap-xs rounded-corner-md py-sm text-label-sm transition-all"
                      style={{
                        background: 'linear-gradient(135deg, color-mix(in srgb, var(--orbi-primary) 15%, transparent), color-mix(in srgb, var(--orbi-secondary) 10%, transparent))',
                        border: '1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)',
                        color: 'var(--orbi-primary)',
                      }}
                      onClick={() => navigate('/pricing')}
                    >
                      <Zap size={12} />
                      Upgrade for unlimited Orbi
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex gap-sm ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {msg.role === 'assistant' && (
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-full"
                      style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}
                    >
                      <Bot size={11} className="text-white" />
                    </div>
                  )}
                  <div
                    className="rounded-corner-md px-md py-sm max-w-[80%]"
                    style={{
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))'
                        : 'color-mix(in srgb, var(--orbi-text) 8%, transparent)',
                      color: msg.role === 'user' ? '#fff' : 'var(--orbi-text)',
                      fontSize: '0.8125rem',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex gap-sm">
                  <div
                    className="flex-shrink-0 flex items-center justify-center rounded-full"
                    style={{ width: 24, height: 24, background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}
                  >
                    <Bot size={11} className="text-white" />
                  </div>
                  <div
                    className="rounded-corner-md px-md py-sm flex items-center gap-xs"
                    style={{ background: 'color-mix(in srgb, var(--orbi-text) 8%, transparent)' }}
                  >
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="rounded-full"
                        style={{ width: 5, height: 5, background: 'var(--orbi-primary)' }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {limitReached && (
                <div
                  className="rounded-corner-md px-md py-sm flex items-center gap-sm"
                  style={{
                    background: 'color-mix(in srgb, var(--status-danger) 8%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--status-danger) 25%, transparent)',
                  }}
                >
                  <Zap size={12} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
                  <p className="text-video-title" style={{ color: 'var(--orbi-text-muted)' }}>
                    Daily limit reached.{' '}
                    <button
                      className="underline"
                      style={{ color: 'var(--orbi-primary)' }}
                      onClick={() => navigate('/pricing')}
                    >
                      Upgrade for unlimited
                    </button>
                  </p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div
              className="flex items-center gap-sm px-md py-md flex-shrink-0"
              style={{ borderTop: '1px solid color-mix(in srgb, var(--orbi-text) 8%, transparent)' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={limitReached || sending}
                placeholder={limitReached ? 'Upgrade to continue...' : 'Ask Orbi anything...'}
                className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
                style={{
                  fontSize: '0.8125rem',
                  fontFamily: 'Atkinson Hyperlegible, sans-serif',
                  opacity: limitReached ? 0.5 : 1,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || limitReached}
                className="flex items-center justify-center rounded-corner-md flex-shrink-0 transition-all"
                style={{
                  width: 30, height: 30,
                  background: !input.trim() || limitReached
                    ? 'color-mix(in srgb, var(--orbi-text) 8%, transparent)'
                    : 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
                  border: 'none',
                  cursor: !input.trim() || limitReached ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={13} className="text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-center rounded-full border-0 outline-none cursor-pointer relative"
        style={{
          width: 52, height: 52,
          background: open
            ? 'color-mix(in srgb, var(--orbi-primary) 20%, var(--orbi-surface))'
            : 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
          boxShadow: '0 4px 24px color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
          border: open ? '1px solid color-mix(in srgb, var(--orbi-primary) 40%, transparent)' : 'none',
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        animate={open ? {} : {
          boxShadow: [
            '0 4px 24px color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
            '0 4px 36px color-mix(in srgb, var(--orbi-primary) 65%, transparent)',
            '0 4px 24px color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
          ],
        }}
        transition={{ duration: 2.4, repeat: open ? 0 : Infinity, ease: 'easeInOut' }}
        aria-label={open ? 'Close Orbi' : 'Open Orbi'}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={20} style={{ color: 'var(--orbi-primary)' }} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Bot size={22} className="text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread dot — shows when widget is closed and messages exist */}
        {!open && messages.length > 0 && (
          <div
            className="absolute top-0 right-0 rounded-full"
            style={{ width: 10, height: 10, background: 'var(--orbi-secondary)', border: '2px solid var(--orbi-surface)' }}
          />
        )}
      </motion.button>
    </div>
  );
}
