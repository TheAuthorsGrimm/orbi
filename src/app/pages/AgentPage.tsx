import { useState } from 'react';
import { PromptPane, ChatBubbles, Avatar, Badge, Button } from '@figma/astraui';
import { Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'ai',
    text: "Hey Alex! 🔮 I'm Orbi — your ADHD productivity companion. I notice you have a few tasks orbiting right now. The proposal review is marked urgent — want me to break it down into manageable micro-steps so it doesn't feel so heavy?",
  },
  {
    id: '2',
    role: 'user',
    text: "Yes please, the proposal feels overwhelming",
  },
  {
    id: '3',
    role: 'ai',
    text: `Got it. Here's a low-friction breakdown for "Review project proposal":

1. 🟢 Open the doc (2 min) — just look, don't judge
2. 🔵 Read exec summary only (5 min) — skip the rest for now
3. 🟡 Comment on ONE section (10 min) — set a 10-min timer
4. ☕ Take a 5-min break — you earned it
5. 🔵 Comment on remaining sections (10 min)
6. ✅ Send feedback — done!

I've added these as steps to your task. Want me to set a 10-min focus timer for step 3?`,
  },
];

const SUGGESTIONS = [
  { label: 'Break down a task', prompt: 'Help me break down my top priority task into micro-steps' },
  { label: 'Plan my day', prompt: 'Help me plan out my day based on my current tasks' },
  { label: 'I\'m overwhelmed', prompt: 'I\'m feeling overwhelmed — help me figure out what to do first' },
];

export function AgentPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [tier] = useState<'agent' | 'free'>('agent');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: `I hear you, Alex. Let me help with that. "${input}" — I'm thinking through the best approach for your ADHD brain. Give me a moment... 

Based on what you've shared, I'd suggest starting with the smallest possible first action. What's the single tiniest step that would move this forward?`,
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  if (tier === 'free') {
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

      {/* Suggestion chips (show when few messages) */}
      {messages.length <= 3 && (
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
          placeholder="Tell Orbi what's on your mind..."
          className="h-full"
        >
          {messages.map(msg => (
            <ChatBubbles
              key={msg.id}
              type={msg.role === 'user' ? 'user' : 'ai'}
              text={msg.text}
              userAvatar={
                msg.role === 'user'
                  ? <Avatar type="initial" initials="AC" size="small" shape="circle" />
                  : undefined
              }
            />
          ))}
        </PromptPane>
      </div>
    </div>
  );
}