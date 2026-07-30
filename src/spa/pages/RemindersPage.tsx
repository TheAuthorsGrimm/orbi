import { useState, useCallback } from 'react';
import { useReminders } from '../hooks/useReminders';
import type { Reminder as ApiReminder } from '@/spa/types';
import { Button, Badge, InputField } from '@figma/astraui';
import { NativeSelectField as SelectField } from '../components/forms/NativeSelectField';
import { Bell, Plus, Trash2, Clock, Brain, Zap, CheckCircle2, Pill } from 'lucide-react';
import { motion } from 'motion/react';
import { useReward } from '../RewardSystem';

// ─── Medication Tracker ───────────────────────────────────────────────────────

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getMondayWeekKey(d: Date) {
  // Key based on the Sunday of this week
  const sun = new Date(d);
  sun.setDate(d.getDate() - d.getDay());
  return sun.toISOString().split('T')[0];
}

function buildWeekDates(today: Date) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - today.getDay() + i); // offset from Sunday
    days.push(d);
  }
  return days;
}

function MedicationTracker() {
  const today = new Date();
  const todayIdx = today.getDay();
  const weekKey = getMondayWeekKey(today);
  const weekDates = buildWeekDates(today);
  const { triggerReward } = useReward();

  const [data, setData] = useState<{ weekKey: string; taken: boolean[] }>(() => {
    try {
      const stored = localStorage.getItem('orbi-med-tracker');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.weekKey === weekKey) return parsed;
      }
    } catch { /* ignore */ }
    return { weekKey, taken: Array(7).fill(false) };
  });

  const toggle = (idx: number) => {
    if (idx > todayIdx) return;
    const wasTaking = !data.taken[idx];
    const newTaken = data.taken.map((v, i) => (i === idx ? !v : v));
    const next = { ...data, taken: newTaken };
    try { localStorage.setItem('orbi-med-tracker', JSON.stringify(next)); } catch { /* ignore */ }
    setData(next);

    if (wasTaking) {
      triggerReward('med_taken');
      if (next.taken.every(Boolean)) {
        setTimeout(() => triggerReward('full_week_med'), 700);
      }
    }
  };

  const takenCount = data.taken.filter(Boolean).length;
  // Days elapsed so far this week (0 through today)
  const daysElapsed = todayIdx + 1;
  const missedCount = daysElapsed - takenCount;

  return (
    <div
      className="rounded-corner-lg p-xl flex flex-col gap-xl"
      style={{
        background: 'var(--orbi-surface)',
        border: '1px solid color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
        boxShadow: '0 4px 40px color-mix(in srgb, var(--orbi-primary) 15%, transparent)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-md">
        <div className="flex items-center gap-md">
          <motion.div
            className="flex items-center justify-center rounded-corner-md"
            style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
              boxShadow: '0 0 20px color-mix(in srgb, var(--orbi-primary) 50%, transparent)',
            }}
            animate={{ boxShadow: ['0 0 16px color-mix(in srgb, var(--orbi-primary) 40%, transparent)', '0 0 32px color-mix(in srgb, var(--orbi-primary) 70%, transparent)', '0 0 16px color-mix(in srgb, var(--orbi-primary) 40%, transparent)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Pill size={22} className="text-white" />
          </motion.div>
          <div>
            <h2 className="text-label text-text-primary">Daily Medication Tracker</h2>
            <p className="text-label-sm text-text-secondary">
              Week of {weekDates[0].toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
              {' '}– {weekDates[6].toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' '}· Resets every Sunday
            </p>
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div
            className="flex items-center gap-sm px-lg py-sm rounded-corner-md"
            style={{ background: 'color-mix(in srgb, var(--orbi-primary) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)' }}
          >
            <CheckCircle2 size={14} style={{ color: 'var(--orbi-primary)' }} />
            <span className="text-label-sm" style={{ color: 'var(--orbi-primary)' }}>
              {takenCount} of {daysElapsed} days taken
            </span>
          </div>
          {missedCount > 0 && (
            <div
              className="flex items-center gap-sm px-lg py-sm rounded-corner-md"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}
            >
              <span className="text-label-sm" style={{ color: '#fca5a5' }}>
                {missedCount} missed
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 7 Day Tiles */}
      <div className="grid grid-cols-7 gap-md">
        {weekDates.map((date, i) => {
          const isToday = i === todayIdx;
          const isPast = i < todayIdx;
          const isFuture = i > todayIdx;
          const taken = data.taken[i];
          const missed = isPast && !taken;

          let tileBg = 'color-mix(in srgb, var(--orbi-text) 3%, transparent)';
          let tileBorder = 'color-mix(in srgb, var(--orbi-text) 8%, transparent)';
          let tileGlow = '';

          if (taken) {
            tileBg = 'rgba(5,150,105,0.15)';
            tileBorder = 'rgba(5,150,105,0.5)';
            tileGlow = '0 0 16px rgba(5,150,105,0.3)';
          } else if (isToday) {
            tileBg = 'color-mix(in srgb, var(--orbi-primary) 15%, transparent)';
            tileBorder = 'color-mix(in srgb, var(--orbi-primary) 70%, transparent)';
            tileGlow = '0 0 20px color-mix(in srgb, var(--orbi-primary) 40%, transparent)';
          } else if (missed) {
            tileBg = 'rgba(239,68,68,0.1)';
            tileBorder = 'rgba(239,68,68,0.4)';
          }

          return (
            <motion.button
              key={i}
              onClick={() => toggle(i)}
              disabled={isFuture}
              className="flex flex-col items-center gap-md rounded-corner-lg py-xl px-md cursor-pointer border-0 relative overflow-hidden"
              style={{
                background: tileBg,
                border: `2px solid ${tileBorder}`,
                boxShadow: tileGlow || undefined,
                opacity: isFuture ? 0.35 : 1,
              }}
              whileHover={!isFuture ? { scale: 1.04 } : {}}
              whileTap={!isFuture ? { scale: 0.96 } : {}}
              aria-label={`${DAY_LABELS[i]} medication ${taken ? 'taken' : 'not taken'}`}
            >
              {/* Today pulse ring */}
              {isToday && !taken && (
                <motion.div
                  className="absolute inset-0 rounded-corner-lg"
                  style={{ border: '2px solid color-mix(in srgb, var(--orbi-primary) 50%, transparent)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}

              <span
                className="text-label-sm"
                style={{
                  color: isToday ? 'var(--orbi-primary)' : taken ? '#6ee7b7' : missed ? '#fca5a5' : 'color-mix(in srgb, var(--orbi-text) 35%, transparent)',
                  fontWeight: isToday ? 700 : 400,
                }}
              >
                {DAY_LABELS[i]}
              </span>

              <span
                className="text-text-primary"
                style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}
              >
                {date.getDate()}
              </span>

              {/* Check icon / status */}
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: 36, height: 36,
                  background: taken
                    ? 'linear-gradient(135deg, #059669, #0d9488)'
                    : missed
                    ? 'rgba(239,68,68,0.15)'
                    : isToday
                    ? 'color-mix(in srgb, var(--orbi-primary) 20%, transparent)'
                    : 'color-mix(in srgb, var(--orbi-text) 5%, transparent)',
                  border: `2px solid ${taken ? '#059669' : missed ? 'rgba(239,68,68,0.4)' : isToday ? 'color-mix(in srgb, var(--orbi-primary) 50%, transparent)' : 'color-mix(in srgb, var(--orbi-text) 8%, transparent)'}`,
                }}
              >
                {taken
                  ? <CheckCircle2 size={18} className="text-white" />
                  : missed
                  ? <span style={{ fontSize: '1rem' }}>✗</span>
                  : isToday
                  ? <Pill size={16} style={{ color: 'var(--orbi-primary)' }} />
                  : <span style={{ color: 'color-mix(in srgb, var(--orbi-text) 20%, transparent)', fontSize: '0.75rem' }}>—</span>
                }
              </div>

              <span
                className="text-label-sm"
                style={{
                  color: taken ? '#6ee7b7' : missed ? '#fca5a5' : isToday ? '#a5b4fc' : 'color-mix(in srgb, var(--orbi-text) 20%, transparent)',
                }}
              >
                {taken ? 'Taken ✓' : missed ? 'Missed' : isToday ? 'Today' : '—'}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Weekly progress bar */}
      <div className="flex flex-col gap-sm">
        <div className="flex justify-between">
          <span className="text-label-sm text-text-secondary">Weekly progress</span>
          <span className="text-label-sm" style={{ color: 'var(--orbi-primary)' }}>
            {takenCount} / 7 days
          </span>
        </div>
        <div className="rounded-full h-2" style={{ background: 'color-mix(in srgb, var(--orbi-text) 8%, transparent)' }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--category-1), var(--orbi-secondary))' }}
            initial={{ width: 0 }}
            animate={{ width: `${(takenCount / 7) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Reminders ───────────────────────────────────────────────────────────────

type ReminderTriggerType = 'time' | 'context' | 'ai';

const TRIGGER_ICONS: Record<ReminderTriggerType, typeof Bell> = {
  time: Clock,
  context: Zap,
  ai: Brain,
};

const TRIGGER_BADGE: Record<ReminderTriggerType, 'default' | 'brand' | 'warning'> = {
  time: 'default',
  context: 'warning',
  ai: 'brand',
};

const TRIGGER_GRADIENT: Record<ReminderTriggerType, string> = {
  time: 'linear-gradient(135deg, #1e1b4b, #13122f)',
  context: 'linear-gradient(135deg, #1a1000, #120900)',
  ai: 'var(--orbi-surface)',
};

const TRIGGER_BORDER: Record<ReminderTriggerType, string> = {
  time: 'color-mix(in srgb, var(--orbi-primary) 30%, transparent)',
  context: 'rgba(217,119,6,0.35)',
  ai: 'color-mix(in srgb, var(--orbi-secondary) 30%, transparent)',
};

export function RemindersPage() {
  const { reminders, loading, addReminder: apiAdd, removeReminder: apiRemove } = useReminders();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('time');
  const [newTime, setNewTime] = useState('09:00');

  const addReminder = useCallback(async () => {
    if (!newTitle.trim()) return;
    await apiAdd({
      title: newTitle,
      triggerType: newTrigger as ApiReminder['triggerType'],
      triggerAt: newTrigger === 'time' ? new Date(`1970-01-01T${newTime}:00`) : undefined,
    });
    setNewTitle('');
    setShowAdd(false);
  }, [newTitle, newTrigger, newTime, apiAdd]);

  return (
    <div className="p-md md:p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">Reminders</h1>
          <p className="text-label-sm text-text-secondary">
            {reminders.length} active reminders · AI-powered nudges
          </p>
        </div>
        <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => setShowAdd(!showAdd)}>
          New Reminder
        </Button>
      </div>

      {/* ── Medication Tracker (always prominent at top) ── */}
      <MedicationTracker />

      {/* Reminder type cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-lg">
        {[
          { type: 'time', label: 'Time-based', desc: 'Triggers at a specific time', icon: Clock, accent: '#a5b4fc', gradient: 'var(--orbi-surface)', border: 'color-mix(in srgb, var(--orbi-primary) 25%, transparent)' },
          { type: 'context', label: 'Context-aware', desc: 'Based on your activity', icon: Zap, accent: '#fcd34d', gradient: 'linear-gradient(145deg, #1a0e00 0%, #110900 100%)', border: 'rgba(217,119,6,0.25)' },
          { type: 'ai', label: 'AI-triggered', desc: 'Orbi decides when you need a nudge', icon: Brain, accent: '#6ee7b7', gradient: 'var(--orbi-surface)', border: 'color-mix(in srgb, var(--orbi-secondary) 25%, transparent)' },
        ].map(item => (
          <div
            key={item.type}
            className="rounded-corner-lg p-lg flex items-start gap-md"
            style={{ background: item.gradient, border: `1px solid ${item.border}` }}
          >
            <item.icon size={18} style={{ color: item.accent }} className="mt-xs flex-shrink-0" />
            <div className="flex flex-col gap-xs">
              <span className="text-label-sm text-text-primary">{item.label}</span>
              <span className="text-label-sm text-text-secondary">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div
          className="rounded-corner-lg p-xl flex flex-col gap-lg"
          style={{ background: 'var(--orbi-surface)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 35%, transparent)' }}
        >
          <h2 className="text-label text-text-primary">New Reminder</h2>
          <div className="flex gap-xl">
            <div className="flex-1">
              <InputField
                label="Reminder text"
                value={newTitle}
                placeholder="What should Orbi remind you about?"
                onChange={setNewTitle}
              />
            </div>
            <SelectField
              label="Trigger type"
              value={newTrigger}
              options={[
                { value: 'time', label: 'Time-based' },
                { value: 'context', label: 'Context-aware' },
                { value: 'ai', label: 'AI-triggered' },
              ]}
              onChange={setNewTrigger}
            />
            {newTrigger === 'time' && (
              <InputField label="Time" type="time" value={newTime} onChange={setNewTime} />
            )}
          </div>
          <div className="flex justify-end gap-md">
            <Button variant="neutral" size="small" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" size="small" onClick={addReminder}>Add Reminder</Button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      {loading ? (
        <p className="text-label-sm text-text-secondary">Loading reminders...</p>
      ) : (
        <div className="flex flex-col gap-lg">
          {reminders.map(reminder => {
            const triggerType = (reminder.triggerType ?? 'time') as ReminderTriggerType;
            const Icon = TRIGGER_ICONS[triggerType];
            return (
              <div
                key={reminder._id}
                className="rounded-corner-lg p-xl flex items-center gap-xl transition-all"
                style={{
                  background: TRIGGER_GRADIENT[triggerType],
                  border: `1px solid ${TRIGGER_BORDER[triggerType]}`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-corner-md flex items-center justify-center flex-shrink-0"
                  style={{ background: 'color-mix(in srgb, var(--orbi-text) 8%, transparent)' }}
                >
                  <Icon size={18} className="text-brand-primary" />
                </div>

                <div className="flex-1 flex flex-col gap-xs">
                  <span className="text-label text-text-primary">{reminder.title}</span>
                  <div className="flex items-center gap-xs">
                    <Badge label={triggerType} variant={TRIGGER_BADGE[triggerType]} />
                    {reminder.recurrence && <Badge label={reminder.recurrence} variant="secondary" />}
                    {triggerType === 'ai' && (
                      <span className="text-label-sm text-text-secondary">Orbi will decide timing</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => apiRemove(reminder._id)}
                  className="text-text-tertiary hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Hyperfocus tip */}
      <div
        className="rounded-corner-lg p-xl flex items-start gap-md"
        style={{
          background: 'var(--orbi-surface)',
          borderLeft: '3px solid #0d9488',
          border: '1px solid color-mix(in srgb, var(--orbi-secondary) 30%, transparent)',
        }}
      >
        <Brain size={18} className="text-brand-primary mt-xs flex-shrink-0" />
        <div className="flex flex-col gap-xs">
          <span className="text-label text-text-primary">Hyperfocus protection active</span>
          <p className="text-label-sm text-text-secondary">
            Orbi watches for signs of hyperfocus and will gently interrupt after 90+ minutes to check in on you.
          </p>
        </div>
      </div>
    </div>
  );
}