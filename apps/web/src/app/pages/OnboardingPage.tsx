import { useState } from 'react';
import { Button, Badge, SwitchField, InputField, SelectField } from '@figma/astraui';
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
        background: 'linear-gradient(145deg, #0a0f1a 0%, #0d1526 60%, #0a1a1a 100%)',
        border: '1px solid rgba(99,102,241,0.4)',
        boxShadow: '0 4px 40px rgba(99,102,241,0.15)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-md">
        <div className="flex items-center gap-md">
          <motion.div
            className="flex items-center justify-center rounded-corner-md"
            style={{
              width: 48, height: 48,
              background: 'linear-gradient(135deg, #6366f1 0%, #0d9488 100%)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5)',
            }}
            animate={{ boxShadow: ['0 0 16px rgba(99,102,241,0.4)', '0 0 32px rgba(99,102,241,0.7)', '0 0 16px rgba(99,102,241,0.4)'] }}
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
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
          >
            <CheckCircle2 size={14} style={{ color: '#a5b4fc' }} />
            <span className="text-label-sm" style={{ color: '#a5b4fc' }}>
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

          let tileBg = 'rgba(255,255,255,0.03)';
          let tileBorder = 'rgba(255,255,255,0.08)';
          let tileGlow = '';

          if (taken) {
            tileBg = 'linear-gradient(145deg, #052e16 0%, #064e3b 100%)';
            tileBorder = 'rgba(5,150,105,0.5)';
            tileGlow = '0 0 16px rgba(5,150,105,0.3)';
          } else if (isToday) {
            tileBg = 'linear-gradient(145deg, #1e1b4b 0%, #1a2e3b 100%)';
            tileBorder = 'rgba(99,102,241,0.7)';
            tileGlow = '0 0 20px rgba(99,102,241,0.4)';
          } else if (missed) {
            tileBg = 'linear-gradient(145deg, #1c0505 0%, #150202 100%)';
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
                  style={{ border: '2px solid rgba(99,102,241,0.5)' }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}

              <span
                className="text-label-sm"
                style={{
                  color: isToday ? '#a5b4fc' : taken ? '#6ee7b7' : missed ? '#fca5a5' : 'rgba(255,255,255,0.35)',
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
                    ? 'rgba(99,102,241,0.2)'
                    : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${taken ? '#059669' : missed ? 'rgba(239,68,68,0.4)' : isToday ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {taken
                  ? <CheckCircle2 size={18} className="text-white" />
                  : missed
                  ? <span style={{ fontSize: '1rem' }}>✗</span>
                  : isToday
                  ? <Pill size={16} style={{ color: '#a5b4fc' }} />
                  : <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}>—</span>
                }
              </div>

              <span
                className="text-label-sm"
                style={{
                  color: taken ? '#6ee7b7' : missed ? '#fca5a5' : isToday ? '#a5b4fc' : 'rgba(255,255,255,0.2)',
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
          <span className="text-label-sm" style={{ color: '#a5b4fc' }}>
            {takenCount} / 7 days
          </span>
        </div>
        <div className="rounded-full h-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            className="h-2 rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #0d9488)' }}
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

interface Reminder {
  id: string;
  title: string;
  triggerType: 'time' | 'context' | 'ai';
  triggerAt?: string;
  recurrence?: string;
  enabled: boolean;
}

const INITIAL_REMINDERS: Reminder[] = [
  { id: '2', title: 'Check in on project proposal', triggerType: 'ai', enabled: true },
  { id: '3', title: 'End of work day wrap-up', triggerType: 'time', triggerAt: '17:30', recurrence: 'weekdays', enabled: true },
  { id: '4', title: 'Drink water', triggerType: 'context', enabled: false },
];

const TRIGGER_ICONS: Record<Reminder['triggerType'], typeof Bell> = {
  time: Clock,
  context: Zap,
  ai: Brain,
};

const TRIGGER_BADGE: Record<Reminder['triggerType'], 'default' | 'brand' | 'warning'> = {
  time: 'default',
  context: 'warning',
  ai: 'brand',
};

const TRIGGER_GRADIENT: Record<Reminder['triggerType'], string> = {
  time: 'linear-gradient(135deg, #1e1b4b, #13122f)',
  context: 'linear-gradient(135deg, #1a1000, #120900)',
  ai: 'linear-gradient(135deg, #031a17, #021210)',
};

const TRIGGER_BORDER: Record<Reminder['triggerType'], string> = {
  time: 'rgba(82,80,243,0.3)',
  context: 'rgba(217,119,6,0.35)',
  ai: 'rgba(13,148,136,0.3)',
};

export function OnboardingPage() {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('time');
  const [newTime, setNewTime] = useState('09:00');

  const toggleReminder = (id: string) =>
    setReminders(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));

  const removeReminder = (id: string) =>
    setReminders(prev => prev.filter(r => r.id !== id));

  const addReminder = () => {
    if (!newTitle.trim()) return;
    const r: Reminder = {
      id: Date.now().toString(),
      title: newTitle,
      triggerType: newTrigger as Reminder['triggerType'],
      triggerAt: newTrigger === 'time' ? newTime : undefined,
      enabled: true,
    };
    setReminders(prev => [r, ...prev]);
    setNewTitle('');
    setShowAdd(false);
  };

  return (
    <div className="p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">Reminders</h1>
          <p className="text-label-sm text-text-secondary">
            {reminders.filter(r => r.enabled).length} active reminders · AI-powered nudges
          </p>
        </div>
        <Button variant="primary" iconStart={<Plus size={16} />} onClick={() => setShowAdd(!showAdd)}>
          New Reminder
        </Button>
      </div>

      {/* ── Medication Tracker (always prominent at top) ── */}
      <MedicationTracker />

      {/* Reminder type cards */}
      <div className="grid grid-cols-3 gap-lg">
        {[
          { type: 'time', label: 'Time-based', desc: 'Triggers at a specific time', icon: Clock, accent: '#a5b4fc', gradient: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: 'rgba(82,80,243,0.25)' },
          { type: 'context', label: 'Context-aware', desc: 'Based on your activity', icon: Zap, accent: '#fcd34d', gradient: 'linear-gradient(145deg, #1a0e00 0%, #110900 100%)', border: 'rgba(217,119,6,0.25)' },
          { type: 'ai', label: 'AI-triggered', desc: 'Orbi decides when you need a nudge', icon: Brain, accent: '#6ee7b7', gradient: 'linear-gradient(145deg, #031a17 0%, #021210 100%)', border: 'rgba(13,148,136,0.25)' },
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
          style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.35)' }}
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
      <div className="flex flex-col gap-lg">
        {reminders.map(reminder => {
          const Icon = TRIGGER_ICONS[reminder.triggerType];
          return (
            <div
              key={reminder.id}
              className={`rounded-corner-lg p-xl flex items-center gap-xl transition-all ${!reminder.enabled ? 'opacity-50' : ''}`}
              style={{
                background: TRIGGER_GRADIENT[reminder.triggerType],
                border: `1px solid ${TRIGGER_BORDER[reminder.triggerType]}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-corner-md flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.08)' }}
              >
                <Icon size={18} className="text-brand-primary" />
              </div>

              <div className="flex-1 flex flex-col gap-xs">
                <span className="text-label text-text-primary">{reminder.title}</span>
                <div className="flex items-center gap-xs">
                  <Badge label={reminder.triggerType} variant={TRIGGER_BADGE[reminder.triggerType]} />
                  {reminder.triggerAt && (
                    <span className="text-label-sm text-text-secondary">{reminder.triggerAt}</span>
                  )}
                  {reminder.recurrence && <Badge label={reminder.recurrence} variant="secondary" />}
                  {reminder.triggerType === 'ai' && (
                    <span className="text-label-sm text-text-secondary">Orbi will decide timing</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-lg">
                <SwitchField
                  label=""
                  hasDescription={false}
                  showLabel={false}
                  defaultSelected={reminder.enabled}
                  onChange={() => toggleReminder(reminder.id)}
                />
                <button
                  onClick={() => removeReminder(reminder.id)}
                  className="text-text-tertiary hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hyperfocus tip */}
      <div
        className="rounded-corner-lg p-xl flex items-start gap-md"
        style={{
          background: 'linear-gradient(145deg, #031a17 0%, #021210 100%)',
          borderLeft: '3px solid #0d9488',
          border: '1px solid rgba(13,148,136,0.3)',
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