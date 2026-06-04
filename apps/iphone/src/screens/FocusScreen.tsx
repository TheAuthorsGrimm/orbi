import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { focus as focusApi, tasks as tasksApi } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

type Phase = 'setup' | 'focus' | 'break' | 'complete';

const DURATIONS = [10, 15, 20, 25, 45];

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(s: number) { return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; }

export function FocusScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [duration, setDuration] = useState(25);
  const [phase, setPhase] = useState<Phase>('setup');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [interruptions, setInterruptions] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    tasksApi.list()
      .then(res => setTasks((res.data ?? []).filter((t: any) => t.status !== 'complete')))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(p => {
          if (p <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setPhase('complete');
            return 0;
          }
          return p - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleStart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await focusApi.start(selectedTaskId || undefined, duration);
      setSessionId(res.data._id);
      setSecondsLeft(duration * 60);
      setPhase('focus');
      setIsRunning(true);
      setInterruptions(0);
    } finally {
      setLoading(false);
    }
  }, [selectedTaskId, duration]);

  const handleComplete = useCallback(async () => {
    if (sessionId) {
      await focusApi.complete(sessionId, { interruptionCount: interruptions }).catch(() => {});
    }
    setCompletedCount(p => p + 1);
    setPhase('break');
    setIsRunning(false);
    setSecondsLeft(5 * 60);
  }, [sessionId, interruptions]);

  const handleReset = () => {
    setIsRunning(false);
    setPhase('setup');
    setSecondsLeft(duration * 60);
    setSessionId(undefined);
  };

  const progress = 1 - secondsLeft / (duration * 60);
  const phaseColor = phase === 'focus' ? '#a78bfa' : phase === 'complete' ? COLORS.success : phase === 'break' ? COLORS.warning : COLORS.textTertiary;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Focus Session</Text>
        <Text style={styles.subtitle}>{completedCount} sessions today</Text>

        {/* Timer */}
        <View style={styles.timerCard}>
          <Text style={[styles.timer, { color: phaseColor }]}>{fmt(secondsLeft)}</Text>
          <Text style={[styles.phaseLabel, { color: phaseColor }]}>
            {phase === 'setup' ? 'Ready to focus' : phase === 'focus' ? 'Focusing...' : phase === 'break' ? 'Take a break ☕' : 'Session complete! 🎉'}
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {phase === 'setup' && (
              <TouchableOpacity style={styles.btnPrimary} onPress={handleStart} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>▶ Start Focus</Text>}
              </TouchableOpacity>
            )}
            {(phase === 'focus' || phase === 'break') && (
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={handleReset}>
                  <Text style={styles.btnSecText}>↺ Reset</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={() => setIsRunning(p => !p)}>
                  <Text style={styles.btnText}>{isRunning ? '⏸ Pause' : '▶ Resume'}</Text>
                </TouchableOpacity>
                {phase === 'focus' && (
                  <TouchableOpacity style={styles.btnSecondary} onPress={() => setInterruptions(p => p + 1)}>
                    <Text style={styles.btnSecText}>⚠ {interruptions}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {phase === 'complete' && (
              <View style={styles.controlRow}>
                <TouchableOpacity style={styles.btnSecondary} onPress={handleReset}>
                  <Text style={styles.btnSecText}>New session</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.btnPrimary} onPress={handleComplete}>
                  <Text style={styles.btnText}>✓ Log session</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Setup options (only in setup phase) */}
        {phase === 'setup' && (
          <>
            <Text style={styles.sectionTitle}>Duration</Text>
            <View style={styles.durationRow}>
              {DURATIONS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationChip, duration === d && styles.durationChipActive]}
                  onPress={() => { setDuration(d); setSecondsLeft(d * 60); }}
                >
                  <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}m</Text>
                </TouchableOpacity>
              ))}
            </View>

            {tasks.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Focus on (optional)</Text>
                {tasks.slice(0, 5).map(t => (
                  <TouchableOpacity
                    key={t._id}
                    style={[styles.taskChip, selectedTaskId === t._id && styles.taskChipActive]}
                    onPress={() => setSelectedTaskId(selectedTaskId === t._id ? '' : t._id)}
                  >
                    <Text style={[styles.taskChipText, selectedTaskId === t._id && styles.taskChipTextActive]} numberOfLines={1}>
                      {selectedTaskId === t._id ? '✓ ' : ''}{t.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: SPACING.xl },
  timerCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    padding: SPACING.xxl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    gap: SPACING.lg,
  },
  timer: { fontSize: 64, fontWeight: '700', letterSpacing: 4 },
  phaseLabel: { fontSize: 14 },
  progressBg: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: RADIUS.full },
  progressFill: { height: 6, backgroundColor: COLORS.brand, borderRadius: RADIUS.full },
  controls: { width: '100%', alignItems: 'center' },
  controlRow: { flexDirection: 'row', gap: SPACING.md, flexWrap: 'wrap', justifyContent: 'center' },
  btnPrimary: { backgroundColor: COLORS.brand, borderRadius: RADIUS.md, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  btnSecondary: { backgroundColor: COLORS.bgCardAlt, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  btnSecText: { color: COLORS.textSecondary, fontSize: 15 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.md },
  durationRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.xl, flexWrap: 'wrap' },
  durationChip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  durationChipActive: { backgroundColor: COLORS.brand + '33', borderColor: COLORS.brand },
  durationText: { color: COLORS.textSecondary, fontSize: 14 },
  durationTextActive: { color: COLORS.brand, fontWeight: '600' },
  taskChip: { padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  taskChipActive: { backgroundColor: COLORS.brand + '22', borderColor: COLORS.brand },
  taskChipText: { color: COLORS.textSecondary, fontSize: 14 },
  taskChipTextActive: { color: COLORS.brand },
});
