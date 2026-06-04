import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { tasks as tasksApi } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';
import type { MainTabParams } from '../navigation/MainNavigator';

type Nav = BottomTabNavigationProp<MainTabParams>;

const AFFIRMATIONS = [
  'You showed up today — that\'s already a win ✦',
  'Your brain works brilliantly. Let\'s harness it ✦',
  'Every small step counts. You\'re crushing it ✦',
  'Progress, not perfection — keep going ✦',
  'Today is yours. Let\'s make it legendary ✦',
];

const PRIORITY_COLOR: Record<string, string> = {
  urgent: COLORS.urgent,
  high: COLORS.high,
  medium: COLORS.medium,
  low: COLORS.low,
};

export function DashboardScreen() {
  const { user } = useAuth();
  const nav = useNavigation<Nav>();
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const affirmation = AFFIRMATIONS[new Date().getDay() % AFFIRMATIONS.length];
  const completedToday = allTasks.filter(t => t.status === 'complete').length;
  const pendingCount = allTasks.filter(t => t.status !== 'complete').length;

  useEffect(() => {
    tasksApi.list()
      .then(res => setAllTasks(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Good {getTimeOfDay()}, {user?.displayName?.split(' ')[0] ?? 'there'} ✦
          </Text>
          <Text style={styles.affirmation}>{affirmation}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard label="Done today" value={`${completedToday}`} color={COLORS.success} icon="✓" />
          <StatCard label="Pending" value={`${pendingCount}`} color={COLORS.brand} icon="◎" />
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <ActionChip label="Focus 25m" icon="⏱" onPress={() => nav.navigate('Focus')} />
          <ActionChip label="Ask Orbi" icon="✦" onPress={() => nav.navigate('Agent')} />
          <ActionChip label="Add Task" icon="+" onPress={() => nav.navigate('Tasks')} />
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's tasks</Text>
          <TouchableOpacity onPress={() => nav.navigate('Tasks')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.brand} style={{ marginTop: SPACING.xl }} />
        ) : allTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tasks yet — add your first one!</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => nav.navigate('Tasks')}>
              <Text style={styles.emptyButtonText}>Add task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          allTasks.slice(0, 5).map(task => (
            <TouchableOpacity
              key={task._id}
              style={[styles.taskRow, task.status === 'complete' && styles.taskDone]}
              onPress={() => nav.navigate('Tasks')}
            >
              <View style={[styles.taskDot, { borderColor: PRIORITY_COLOR[task.priority] ?? COLORS.brand }]}>
                {task.status === 'complete' && <Text style={styles.taskCheck}>✓</Text>}
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.status === 'complete' && styles.taskTitleDone]}>
                  {task.title}
                </Text>
                <Text style={[styles.taskPriority, { color: PRIORITY_COLOR[task.priority] ?? COLORS.brand }]}>
                  {task.priority}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: string; color: string; icon: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '55' }]}>
      <Text style={[styles.statIcon, { color }]}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionChip({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.actionChip} onPress={onPress}>
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, paddingHorizontal: SPACING.xl },
  header: { paddingTop: SPACING.xl, paddingBottom: SPACING.lg },
  greeting: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary },
  affirmation: { fontSize: 13, color: '#a78bfa', marginTop: SPACING.xs },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  statIcon: { fontSize: 20 },
  statValue: { fontSize: 28, fontWeight: '700' },
  statLabel: { fontSize: 12, color: COLORS.textSecondary },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: SPACING.md },
  seeAll: { fontSize: 13, color: COLORS.brand },
  actionsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  actionChip: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionIcon: { fontSize: 20, color: COLORS.brand },
  actionLabel: { fontSize: 12, color: COLORS.textSecondary },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    gap: SPACING.md,
  },
  taskDone: { opacity: 0.55 },
  taskDot: {
    width: 22,
    height: 22,
    borderRadius: RADIUS.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskCheck: { fontSize: 12, color: COLORS.success },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, color: COLORS.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  taskPriority: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  emptyCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.brandBorder,
    padding: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  emptyButton: { backgroundColor: COLORS.brand, borderRadius: RADIUS.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
  emptyButtonText: { color: '#fff', fontWeight: '600' },
});
