import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tasks as tasksApi } from '../services/api';
import { COLORS, SPACING, RADIUS } from '../theme';

type Priority = 'urgent' | 'high' | 'medium' | 'low';
type TaskList = 'needs' | 'wants';

const PRIORITY_COLOR: Record<Priority, string> = {
  urgent: COLORS.urgent,
  high: COLORS.high,
  medium: COLORS.medium,
  low: COLORS.textTertiary,
};

const PRIORITIES: Priority[] = ['urgent', 'high', 'medium', 'low'];

export function TasksScreen() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [wants, setWants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskList>('needs');
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('high');

  const loadTasks = useCallback(async () => {
    try {
      const res = await tasksApi.list();
      const all: any[] = res.data ?? [];
      setNeeds(all.filter(t => t.priority === 'urgent' || t.priority === 'high'));
      setWants(all.filter(t => t.priority === 'medium' || t.priority === 'low'));
    } catch {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const addTask = async () => {
    if (!input.trim()) return;
    try {
      const res = await tasksApi.create({ title: input.trim(), priority, status: 'pending' });
      const task = res.data;
      if (priority === 'urgent' || priority === 'high') setNeeds(p => [task, ...p]);
      else setWants(p => [task, ...p]);
      setInput('');
    } catch {
      Alert.alert('Error', 'Could not add task');
    }
  };

  const toggleTask = async (task: any, list: TaskList) => {
    const completing = task.status !== 'complete';
    try {
      if (completing) await tasksApi.complete(task._id);
      else await tasksApi.update(task._id, { status: 'pending' });
      const update = (t: any) => t._id === task._id ? { ...t, status: completing ? 'complete' : 'pending' } : t;
      if (list === 'needs') setNeeds(p => p.map(update));
      else setWants(p => p.map(update));
    } catch {}
  };

  const deleteTask = async (id: string, list: TaskList) => {
    try {
      await tasksApi.delete(id);
      if (list === 'needs') setNeeds(p => p.filter(t => t._id !== id));
      else setWants(p => p.filter(t => t._id !== id));
    } catch {}
  };

  const current = activeTab === 'needs' ? needs : wants;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Planner</Text>
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'needs' && styles.tabActive]}
            onPress={() => setActiveTab('needs')}
          >
            <Text style={[styles.tabText, activeTab === 'needs' && styles.tabTextActive]}>
              🔥 Needs ({needs.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'wants' && styles.tabActive]}
            onPress={() => setActiveTab('wants')}
          >
            <Text style={[styles.tabText, activeTab === 'wants' && styles.tabTextActive]}>
              ⭐ Wants ({wants.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Task */}
      <View style={styles.addBox}>
        <TextInput
          style={styles.addInput}
          placeholder={activeTab === 'needs' ? 'What MUST happen today?' : 'What would be great today?'}
          placeholderTextColor={COLORS.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={addTask}
          returnKeyType="done"
        />
        <View style={styles.priorityRow}>
          {PRIORITIES.map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.priorityChip, { borderColor: PRIORITY_COLOR[p] }, priority === p && { backgroundColor: PRIORITY_COLOR[p] + '33' }]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.priorityText, { color: priority === p ? PRIORITY_COLOR[p] : COLORS.textTertiary }]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.brand} style={{ marginTop: SPACING.xl }} />
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {current.length === 0 ? (
            <Text style={styles.empty}>Nothing here yet — add your first one!</Text>
          ) : (
            current.map(task => (
              <View key={task._id} style={[styles.taskRow, task.status === 'complete' && styles.taskDone]}>
                <TouchableOpacity
                  style={[styles.check, task.status === 'complete' && styles.checkDone]}
                  onPress={() => toggleTask(task, activeTab)}
                >
                  {task.status === 'complete' && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.status === 'complete' && styles.taskTitleDone]}>
                    {task.title}
                  </Text>
                  <Text style={[styles.taskPriority, { color: PRIORITY_COLOR[task.priority as Priority] ?? COLORS.brand }]}>
                    {task.priority}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => deleteTask(task._id, activeTab)} style={styles.deleteBtn}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.textPrimary, marginBottom: SPACING.lg },
  tabs: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  tab: { flex: 1, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.brand + '22', borderColor: COLORS.brand },
  tabText: { fontSize: 13, color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.brand, fontWeight: '600' },
  addBox: { marginHorizontal: SPACING.xl, backgroundColor: COLORS.bgCard, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.brandBorder, padding: SPACING.lg, marginBottom: SPACING.lg },
  addInput: { color: COLORS.textPrimary, fontSize: 15, marginBottom: SPACING.md },
  priorityRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  priorityChip: { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1 },
  priorityText: { fontSize: 11, textTransform: 'capitalize' },
  addBtn: { marginLeft: 'auto', backgroundColor: COLORS.brand + '33', width: 30, height: 30, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: COLORS.brand, fontSize: 20, lineHeight: 22 },
  list: { flex: 1, paddingHorizontal: SPACING.xl },
  empty: { color: COLORS.textTertiary, fontSize: 14, textAlign: 'center', marginTop: SPACING.xxl },
  taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: SPACING.sm, gap: SPACING.md },
  taskDone: { opacity: 0.5 },
  check: { width: 22, height: 22, borderRadius: RADIUS.full, borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  checkDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  checkMark: { color: '#fff', fontSize: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, color: COLORS.textPrimary },
  taskTitleDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  taskPriority: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  deleteBtn: { padding: SPACING.xs },
  deleteText: { color: COLORS.textTertiary, fontSize: 14 },
});
