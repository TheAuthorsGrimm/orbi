import { useState } from 'react';
import { PromptPane, ChatBubbles, Avatar, Badge, Button } from '@figma/astraui';
import { Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useChat } from '../hooks/useChat';
import { useAuth } from '@/spa/context/AuthContext';
import { OrbiTier } from '@/spa/types';

const SUGGESTIONS = [
  { label: 'Break down a task', prompt: 'Help me break down my top priority task into micro-steps' },
  { label: 'Plan my day', prompt: 'Help me plan out my day based on my current tasks' },
  { label: 'I\'m overwhelmed', prompt: 'I\'m feeling overwhelmed — help me figure out what to do first' },
];

export function AgentPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { messages, sending, sendMessage } = useChat();
  const [input, setInput] = useState('');

  const tier = user?.tier ?? OrbiTier.FREE;

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  if (tier === OrbiTier.FREE) {
    return (
      <div className="p-2xl flex flex-col gap-xl items-center justify-center min-h-full">
        <div className="bg-surface-bg rounded-corner-lg p-xl max-w-md flex flex-col items-center gap-lg text-center">
          <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center">
            <Lock size={24} className="text-on-brand" />
          </div>
          <h2 className="text-heading text-text-primary">Orbi AI Agent</h2>
          <p className="text-label-sm text-text-secondary">
            The AI Agent is available on the Orbi Agent plan ($9.99/mo).
            Unlock Claude-powered proactive check-ins, task decomposition, and unlimited tasks.
          </p>
          <Button variant="primary" onClick={() => navigate('/pricing')}>
            Upgrade to Agent
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="p-xl flex items-center gap-md"
        style={{
          background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
          borderBottom: '1px solid rgba(82,80,243,0.25)',
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
        <div className="ml-auto flex items-center gap-xs">
          <Sparkles size={14} className="text-brand-primary" />
          <span className="text-video-title text-text-secondary">Orbi Agent Plan</span>
        </div>
      </div>

      {/* Suggestion chips (show when no messages yet) */}
      {messages.length === 0 && (
        <div className="px-xl pt-xl flex gap-md flex-wrap">
          {SUGGESTIONS.map(s => (
            <button
              key={s.label}
              onClick={() => setInput(s.prompt)}
              className="rounded-corner-md px-lg py-sm text-label-sm text-text-secondary transition-all"
              style={{
                background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
                border: '1px solid rgba(82,80,243,0.3)',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Chat area */}
      <div className="flex-1 min-h-0">
        <PromptPane
          value={input}
          onChange={setInput}
          onSend={handleSend}
          placeholder={sending ? 'Orbi is thinking...' : 'Tell Orbi what\'s on your mind...'}
          className="h-full"
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