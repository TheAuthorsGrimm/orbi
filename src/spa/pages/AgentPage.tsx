import { useState, useEffect } from 'react';
import { PromptPane, ChatBubbles, Avatar, Badge, Button } from '@figma/astraui';
import { Sparkles, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useChat } from '../hooks/useChat';
import { useAuth } from '@/spa/context/AuthContext';
import { OrbiTier } from '@/spa/types';

const FREE_DAILY_LIMIT = 5;

const SUGGESTIONS = [
  { label: 'Break down a task', prompt: 'Help me break down my top priority task into micro-steps' },
  { label: 'Plan my day', prompt: 'Help me plan out my day based on my current tasks' },
  { label: "I'm overwhelmed", prompt: "I'm feeling overwhelmed — help me figure out what to do first" },
];

export function AgentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sending, sendMessage, limitReached, messagesUsedToday } = useChat();
  const [input, setInput] = useState('');

  const tier = user?.tier ?? OrbiTier.FREE;
  const isFree = tier === OrbiTier.FREE;
  const messagesLeft = Math.max(0, FREE_DAILY_LIMIT - messagesUsedToday);

  const handleSend = async () => {
    if (!input.trim() || sending || limitReached) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-xl flex items-center gap-md"
        style={{
          background: 'var(--orbi-surface)',
          borderBottom: '1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)',
        }}
      >
        <Avatar type="initial" initials="O" size="medium" shape="circle" />
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-md">
            <span className="text-label text-text-primary">Orbi</span>
            <Badge label="Claude-powered" variant="brand" />
          </div>
          <p className="text-label-sm text-text-secondary">Your ADHD productivity companion</p>
        </div>
        <div className="ml-auto flex items-center gap-md">
          {isFree ? (
            <div className="flex items-center gap-md">
              {/* Usage meter */}
              <div className="flex flex-col items-end gap-xs">
                <span className="text-video-title text-text-secondary">
                  {messagesLeft} / {FREE_DAILY_LIMIT} messages today
                </span>
                <div className="w-24 h-1 rounded-full" style={{ background: 'color-mix(in srgb, var(--orbi-text) 10%, transparent)' }}>
                  <div
                    className="h-1 rounded-full transition-all"
                    style={{
                      width: `${(messagesUsedToday / FREE_DAILY_LIMIT) * 100}%`,
                      background: messagesLeft <= 1
                        ? 'var(--status-danger)'
                        : 'linear-gradient(90deg, var(--orbi-primary), var(--orbi-secondary))',
                    }}
                  />
                </div>
              </div>
              <Button variant="primary" size="small" onClick={() => navigate('/pricing')}>
                <Zap size={13} style={{ marginRight: 4 }} />
                Unlock full Orbi
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-xs">
              <Sparkles size={14} className="text-brand-primary" />
              <span className="text-video-title text-text-secondary">
                {tier === OrbiTier.AGENT ? 'Orbi Agent Plan' : 'Orbi Full Plan'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Free-tier teaser banner (shown at top when free) */}
      {isFree && messages.length === 0 && (
        <div
          className="mx-xl mt-xl rounded-corner-lg px-xl py-lg flex items-center gap-md"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--orbi-primary) 12%, transparent), color-mix(in srgb, var(--orbi-secondary) 8%, transparent))',
            border: '1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--orbi-primary)', flexShrink: 0 }} />
          <p className="text-label-sm text-text-secondary flex-1">
            <strong className="text-text-primary">You're on the free plan.</strong> You get {FREE_DAILY_LIMIT} Orbi messages per day — just enough to feel the magic. Upgrade to unlock unlimited AI conversations, task decomposition, and proactive check-ins.
          </p>
          <button
            className="flex items-center gap-xs text-label-sm flex-shrink-0"
            style={{ color: 'var(--orbi-primary)' }}
            onClick={() => navigate('/pricing')}
          >
            See plans <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Suggestion chips (show when no messages yet) */}
      {messages.length === 0 && (
        <div className="px-xl pt-xl flex gap-md flex-wrap">
          {SUGGESTIONS.map(s => (
            <button
              key={s.label}
              onClick={() => !limitReached && setInput(s.prompt)}
              className="rounded-corner-md px-lg py-sm text-label-sm text-text-secondary transition-all"
              style={{
                background: 'var(--orbi-surface)',
                border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)',
                opacity: limitReached ? 0.5 : 1,
                cursor: limitReached ? 'not-allowed' : 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Limit-reached banner */}
      {limitReached && (
        <div
          className="mx-xl mt-xl rounded-corner-lg px-xl py-lg flex items-center gap-md"
          style={{
            background: 'color-mix(in srgb, var(--status-danger) 8%, var(--orbi-surface))',
            border: '1px solid color-mix(in srgb, var(--status-danger) 30%, transparent)',
          }}
        >
          <Zap size={16} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
          <p className="text-label-sm text-text-secondary flex-1">
            You've used all {FREE_DAILY_LIMIT} free messages for today. Come back tomorrow, or upgrade for unlimited access to Orbi.
          </p>
          <Button variant="primary" size="small" onClick={() => navigate('/pricing')}>
            Upgrade now
          </Button>
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 min-h-0">
        <PromptPane
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder={
            limitReached
              ? 'Daily limit reached — upgrade for unlimited Orbi'
              : sending
              ? 'Orbi is thinking...'
              : "Tell Orbi what's on your mind..."
          }
          className="h-full"
          disabled={limitReached}
        >
          {messages.map(msg => (
            <ChatBubbles
              key={msg._id}
              type={msg.role === 'user' ? 'user' : 'ai'}
              text={msg.content}
              userAvatar={
                msg.role === 'user'
                  ? <Avatar type="initial" initials={user?.displayName?.slice(0, 2).toUpperCase() ?? 'ME'} size="small" shape="circle" />
                  : undefined
              }
            />
          ))}
        </PromptPane>
      </div>
    </div>
  );
}
