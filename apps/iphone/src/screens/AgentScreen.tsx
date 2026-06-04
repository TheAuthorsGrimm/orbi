import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { chat as chatApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { COLORS, SPACING, RADIUS } from '../theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  'Help me break down my top task into micro-steps',
  'I\'m feeling overwhelmed — what should I do first?',
  'Help me plan my day',
];

export function AgentScreen() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || sending) return;
    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text.trim() };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setSending(true);
    try {
      const res = await chatApi.send(text.trim(), sessionId);
      const { message, sessionId: sid } = res.data;
      setSessionId(sid);
      setMessages(p => [...p, { id: message._id, role: 'assistant', content: message.content }]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      setMessages(p => [...p, { id: `err-${Date.now()}`, role: 'assistant', content: 'Something went wrong. Try again.' }]);
    } finally {
      setSending(false);
    }
  }, [sending, sessionId]);

  const initials = user?.displayName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'ME';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>✦</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Orbi</Text>
            <Text style={styles.headerSub}>Claude-powered ADHD companion</Text>
          </View>
        </View>

        {/* Messages */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyGreeting}>Hey {user?.displayName?.split(' ')[0] ?? 'there'}! 🔮</Text>
              <Text style={styles.emptyText}>I'm Orbi, your ADHD productivity companion. What's on your mind?</Text>
              <View style={styles.suggestionList}>
                {SUGGESTIONS.map(s => (
                  <TouchableOpacity key={s} style={styles.suggestion} onPress={() => sendMessage(s)}>
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              {item.role === 'user' && (
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>{initials}</Text>
                </View>
              )}
              <View style={[styles.bubbleContent, item.role === 'user' ? styles.bubbleContentUser : styles.bubbleContentAI]}>
                <Text style={styles.bubbleText}>{item.content}</Text>
              </View>
            </View>
          )}
        />

        {sending && (
          <View style={styles.typingRow}>
            <ActivityIndicator size="small" color={COLORS.brand} />
            <Text style={styles.typingText}>Orbi is thinking...</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Tell Orbi what's on your mind..."
            placeholderTextColor={COLORS.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || sending}
          >
            <Text style={styles.sendIcon}>↑</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.brandBorder,
    backgroundColor: COLORS.bgCard,
  },
  avatar: {
    width: 40, height: 40, borderRadius: RADIUS.full,
    backgroundColor: COLORS.brand,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary },
  messageList: { padding: SPACING.lg, gap: SPACING.md, flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingTop: SPACING.xxl },
  emptyGreeting: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.textSecondary, marginBottom: SPACING.xl, lineHeight: 20 },
  suggestionList: { gap: SPACING.sm },
  suggestion: {
    padding: SPACING.md, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.brandBorder,
    backgroundColor: COLORS.bgCard,
  },
  suggestionText: { color: COLORS.textSecondary, fontSize: 13 },
  bubble: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleAI: { justifyContent: 'flex-start' },
  userAvatar: {
    width: 28, height: 28, borderRadius: RADIUS.full,
    backgroundColor: COLORS.brand,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  userAvatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  bubbleContent: { maxWidth: '78%', borderRadius: RADIUS.lg, padding: SPACING.md },
  bubbleContentUser: { backgroundColor: COLORS.brand, borderBottomRightRadius: RADIUS.sm },
  bubbleContentAI: { backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.brandBorder, borderBottomLeftRadius: RADIUS.sm },
  bubbleText: { color: COLORS.textPrimary, fontSize: 14, lineHeight: 20 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingBottom: SPACING.sm },
  typingText: { color: COLORS.textTertiary, fontSize: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.bgCard,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bg,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    fontSize: 14,
    maxHeight: 120,
  },
  sendBtn: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.brand, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
