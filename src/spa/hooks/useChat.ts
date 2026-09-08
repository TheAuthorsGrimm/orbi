import { useState, useCallback } from 'react';
import { chat as chatApi } from '@/spa/api-client';
import type { ChatMessage } from '@/spa/types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [messagesUsedToday, setMessagesUsedToday] = useState(0);

  const sendMessage = useCallback(async (content: string) => {
    if (limitReached) return;

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
      setMessagesUsedToday(p => p + 1);
    } catch (err: unknown) {
      setMessages(p => p.filter(m => m._id !== optimistic._id));
      // Check for daily limit 429 response
      const axiosErr = err as { response?: { status: number; data?: { limitReached?: boolean; used?: number; limit?: number } } };
      if (axiosErr?.response?.status === 429 && axiosErr.response.data?.limitReached) {
        setLimitReached(true);
        setMessagesUsedToday(axiosErr.response.data.used ?? 5);
      }
    } finally {
      setSending(false);
    }
  }, [sessionId, limitReached]);

  return { messages, sending, sendMessage, sessionId, limitReached, messagesUsedToday };
}
