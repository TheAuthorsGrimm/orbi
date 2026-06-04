import { useState, useCallback } from 'react';
import { chat as chatApi } from '@orbi/api-client';
import type { ChatMessage } from '@orbi/types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      sessionId: sessionId ?? '',
      userId: '',
      role: 'user',
      content,
      createdAt: new Date(),
    };
    setMessages(p => [...p, optimistic]);
    setSending(true);
    try {
      const res = await chatApi.send(content, sessionId);
      const { message, sessionId: sid } = res.data.data!;
      setSessionId(sid);
      setMessages(p => [...p.filter(m => m._id !== optimistic._id), optimistic, message]);
    } catch {
      setMessages(p => p.filter(m => m._id !== optimistic._id));
    } finally {
      setSending(false);
    }
  }, [sessionId]);

  return { messages, sending, sendMessage, sessionId };
}
