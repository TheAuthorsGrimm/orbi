import { useTasks } from '../hooks/useTasks';
import { useNavigate } from 'react-router';
import { Badge, Button, Tooltip } from '@figma/astraui';
import {
  CheckCircle2, Clock, Flame, Zap, Plus, ArrowRight, Bot,
  Timer, Bell, CalendarDays, Sparkles, Target, Brain,
} from 'lucide-react';
import { motion } from 'motion/react';
import { XPStatsCard } from '../RewardSystem';
import { useOrbiProfile } from '../OrbiProfileContext';
import { useAuth } from '@/spa/context/AuthContext';

// Dopamine-boosting affirmations — rotated daily for that returning-user spike
const AFFIRMATIONS = [
  "You showed up today — that's already a win ✦",
  "Your brain works brilliantly. Let's harness it ✦",
  "Every small step counts. You're crushing it ✦",
  "You're more capable than you remember ✦",
  "Progress, not perfection — keep going ✦",
  "Today is yours. Let's make it legendary ✦",
  "You came back. That takes real strength ✦",
];

const todayAffirmation = AFFIRMATIONS[new Date().getDay()];


const ORBIT_ANGLES = [0, 90, 180, 270];

const STAT_CARDS = [
  {
    icon: CheckCircle2,
    label: 'Done today',
    getValue: (v: number) => `${v} task`,
    accent: 'var(--orbi-secondary)',
  },
  {
    icon: Clock,
    label: 'Focus time',
    getValue: (v: number) => `${v} min`,
    accent: 'var(--orbi-primary)',
  },
  {
    icon: Flame,
    label: 'Day streak',
    getValue: (v: number) => `${v} days`,
    accent: 'var(--orbi-primary)',
  },
  {
    icon: Zap,
    label: 'Energy',
    getValue: (_v: number) => 'Medium',
    accent: 'var(--orbi-secondary)',
  },
];

const QUICK_ACTIONS = [
  { label: 'Focus 25min', icon: Timer,       path: '/focus',     accent: 'var(--orbi-primary)' },
  { label: 'Ask Orbi',    icon: Bot,          path: '/agent',     accent: 'var(--orbi-secondary)' },
  { label: 'Reminders',   icon: Bell,         path: '/reminders', accent: 'var(--orbi-primary)' },
  { label: 'Calendar',    icon: CalendarDays, path: '/calendar',  accent: 'var(--orbi-secondary)' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { profile, isOnboarded } = useOrbiProfile();
  const { user } = useAuth();
  const { needs, wants } = useTasks();
  const displayedName = profile.preferredName || user?.displayName?.split(' ')[0] || 'friend';

  const allTasks = [...needs, ...wants];
  const completedToday = allTasks.filter(t => t.status === 'complete').length;
  const focusMinutes = 0;
  const streak = 0;

  const statValues = [completedToday, focusMinutes, streak, 0];

  // Use real tasks for orbit display
  const ORBIT_TASKS = allTasks.slice(0, 4).map(t => ({
    id: t._id,
    title: t.title,
    priority: t.priority,
    status: t.status,
  }));

  const priorityVariantOrbit: Record<string, 'danger' | 'warning' | 'default' | 'secondary'> = {
    urgent: 'danger',
    high: 'warning',
    medium: 'default',
    low: 'secondary',
  };

  const greeting = `Good afternoon, ${displayedName} ✦`;

  return (
    <div className="p-md md:p-xl flex flex-col gap-lg min-h-full">
      {/* ── Onboarding nudge ── */}
      {!isOnboarded && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-corner-lg px-xl py-lg flex items-center gap-lg cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, color-mix(in srgb, var(--orbi-primary) 20%, transparent), color-mix(in srgb, var(--orbi-secondary) 12%, transparent))',
            border: '1.5px solid color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
          }}
          onClick={() => navigate('/onboarding')}
        >
          <div className="p-md rounded-corner-md flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}>
            <Brain size={18} className="text-white" />
          </div>
          <div className="flex flex-col gap-xs flex-1">
            <p className="text-label text-text-primary">Complete your Orbi profile — it takes 3 minutes</p>
            <p className="text-label-sm text-text-secondary">
              Tell Orbi about your goals, career, task categories, and how your brain works for a truly personal AI companion
            </p>
          </div>
          <Button variant="primary" size="small" onClick={() => navigate('/onboarding')}>
            Set up now
          </Button>
        </motion.div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">{greeting}</h1>
          <p className="text-label-sm" style={{ color: 'var(--orbi-primary)' }}>
            {todayAffirmation}
          </p>
          <p className="text-label-sm text-text-tertiary">
            Sunday, May 10, 2026 · Orbi Full Plan
          </p>
        </div>

        <div className="flex items-center gap-md">
          {/* Orbi button — gradient so it never disappears into the bg */}
          <motion.button
            className="flex items-center gap-sm px-lg py-md rounded-corner-md text-white cursor-pointer border-0 outline-none"
            style={{
              background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
              boxShadow: '0 0 18px color-mix(in srgb, var(--orbi-primary) 50%, transparent), 0 0 6px color-mix(in srgb, var(--orbi-secondary) 40%, transparent)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px color-mix(in srgb, var(--orbi-primary) 70%, transparent), 0 0 10px color-mix(in srgb, var(--orbi-secondary) 50%, transparent)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/agent')}
          >
            <Bot size={16} />
            <span className="text-label-sm">Ask Orbi</span>
          </motion.button>

          <Button
            variant="primary"
            size="small"
            iconStart={<Plus size={16} />}
            onClick={() => navigate('/tasks')}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="p-lg flex items-center gap-md"
            style={{
              background: 'var(--orbi-surface)',
              border: '1px solid var(--orbi-border)',
              borderLeft: `3px solid ${stat.accent}`,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div
              className="flex-shrink-0 p-md"
              style={{ background: `color-mix(in srgb, ${stat.accent} 12%, transparent)` }}
            >
              <stat.icon size={20} style={{ color: stat.accent }} />
            </div>
            <div className="flex flex-col gap-xs">
              <span className="text-video-title text-text-secondary">
                {stat.label}
              </span>
              <span className="text-label text-text-primary">
                {stat.getValue(statValues[i])}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Row: Orbital + Right Panel ── */}
      <div className="flex flex-col md:flex-row gap-lg flex-1 min-h-0">

        {/* ── Left: Orbital + Quick Actions ── */}
        <div className="flex flex-col gap-lg flex-1 min-w-0">

          {/* Orbital visualization */}
          <div
            className="rounded-corner-lg p-xl flex flex-col gap-lg flex-1"
            style={{ background: 'var(--orbi-surface)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-md">
                <Target size={16} style={{ color: 'var(--orbi-primary)' }} />
                <h2 className="text-label text-text-primary">Focus Orbit</h2>
              </div>
              <Badge label={`${ORBIT_TASKS.length} orbiting`} variant="brand" />
            </div>

            <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: 280 }}>
              {/* Orbit rings */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 240, height: 240,
                  border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)',
                  boxShadow: 'inset 0 0 40px color-mix(in srgb, var(--orbi-primary) 5%, transparent)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 320, height: 320,
                  border: '1px dashed color-mix(in srgb, var(--orbi-secondary) 20%, transparent)',
                }}
              />

              {/* Pulsing center node */}
              <motion.div
                className="absolute z-10 flex flex-col items-center justify-center rounded-full"
                style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))',
                }}
                animate={{
                  boxShadow: [
                    '0 0 0 0px color-mix(in srgb, var(--orbi-primary) 50%, transparent)',
                    '0 0 0 20px color-mix(in srgb, var(--orbi-primary) 0%, transparent)',
                    '0 0 0 0px color-mix(in srgb, var(--orbi-primary) 0%, transparent)',
                  ],
                }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut' }}
              >
                <Sparkles size={14} className="text-white" />
                <span className="text-white" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.05em' }}>FOCUS</span>
              </motion.div>

              {/* Orbiting task nodes */}
              {ORBIT_TASKS.map((task, i) => {
                const angleDeg = ORBIT_ANGLES[i] - 45;
                const rad = (angleDeg * Math.PI) / 180;
                const radius = 120;
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;

                return (
                  <motion.div
                    key={task.id}
                    className="absolute z-20"
                    style={{ left: `calc(50% + ${x}px - 60px)`, top: `calc(50% + ${y}px - 22px)` }}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.12 }}
                  >
                    <Tooltip content={task.title} position="top">
                      <div
                        className="rounded-corner-md px-md py-sm cursor-pointer transition-all"
                        style={{
                          width: 120,
                          background: task.status === 'complete'
                            ? 'rgba(5,150,105,0.2)'
                            : 'color-mix(in srgb, var(--orbi-text) 6%, transparent)',
                          border: `1px solid ${task.status === 'complete' ? 'rgba(5,150,105,0.5)' : 'color-mix(in srgb, var(--orbi-primary) 40%, transparent)'}`,
                          backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => navigate('/tasks')}
                      >
                        <p className="text-video-title text-text-primary truncate">{task.title}</p>
                        <Badge label={task.priority} variant={priorityVariantOrbit[task.priority]} />
                      </div>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                className="p-lg flex flex-col items-center gap-md cursor-pointer border-0"
                style={{
                  background: `color-mix(in srgb, ${action.accent} 8%, var(--orbi-surface))`,
                  border: `1px solid color-mix(in srgb, ${action.accent} 28%, var(--orbi-border))`,
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
              >
                <action.icon size={22} style={{ color: action.accent }} />
                <span className="text-video-title" style={{ color: 'var(--orbi-text)' }}>{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-lg w-full md:w-[300px] md:flex-shrink-0">

          {/* XP / Level card */}
          <XPStatsCard />

          {/* Orbi AI Suggestion — gradient card so it stands out */}
          <motion.div
            className="rounded-corner-lg p-xl flex flex-col gap-lg"
            style={{
              background: 'var(--orbi-surface)',
              border: '1px solid color-mix(in srgb, var(--orbi-primary) 40%, transparent)',
              boxShadow: '0 4px 32px color-mix(in srgb, var(--orbi-primary) 20%, transparent)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-md">
              <div
                className="p-sm rounded-corner-md"
                style={{ background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}
              >
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-label text-text-primary">Orbi says</span>
              <Badge label="Agent" variant="brand" />
            </div>
            <p className="text-label-sm text-text-secondary">
              {allTasks.length > 0
                ? `Hey ${displayedName}! You've got ${allTasks.length} task${allTasks.length === 1 ? '' : 's'} on the go. Want me to help you break the next one into smaller steps? Starting small reduces ADHD task paralysis. 🔮`
                : `Hey ${displayedName}! Ready to capture what's on your mind? Add a task and I'll help you break it down into ADHD-friendly micro-steps. 🔮`}
            </p>
            <button
              className="flex items-center justify-center gap-sm px-md py-sm rounded-corner-md text-white cursor-pointer border-0"
              style={{ background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}
              onClick={() => navigate('/agent')}
            >
              <span className="text-label-sm">Talk to Orbi</span>
              <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Today's Tasks */}
          <div
            className="rounded-corner-lg p-xl flex flex-col gap-lg flex-1"
            style={{
              background: 'var(--orbi-surface)',
              border: '1px solid color-mix(in srgb, var(--orbi-text) 8%, transparent)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-label text-text-primary">Today's tasks</h2>
              <Button variant="subtle" size="small" onClick={() => navigate('/tasks')}>
                View all
              </Button>
            </div>

            <div className="flex flex-col gap-sm flex-1">
              {allTasks.slice(0, 5).map((task) => (
                <motion.div
                  key={task._id}
                  className="flex items-center gap-md px-md py-sm rounded-corner-md cursor-pointer transition-all"
                  style={{
                    background: task.status === 'complete'
                      ? 'rgba(5,150,105,0.08)'
                      : 'color-mix(in srgb, var(--orbi-text) 4%, transparent)',
                    border: `1px solid ${task.status === 'complete' ? 'rgba(5,150,105,0.2)' : 'color-mix(in srgb, var(--orbi-text) 6%, transparent)'}`,
                    opacity: task.status === 'complete' ? 0.65 : 1,
                  }}
                  whileHover={{ background: 'color-mix(in srgb, var(--orbi-primary) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--orbi-primary) 30%, transparent)' }}
                  onClick={() => navigate('/tasks')}
                >
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: task.status === 'complete' ? '#059669' : 'color-mix(in srgb, var(--orbi-text) 25%, transparent)',
                      background: task.status === 'complete' ? '#059669' : 'transparent',
                    }}
                  >
                    {task.status === 'complete' && <CheckCircle2 size={10} className="text-white" />}
                  </div>
                  <div className="flex flex-col gap-xs flex-1 min-w-0">
                    <p className={`text-label-sm text-text-primary truncate ${task.status === 'complete' ? 'line-through' : ''}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-xs">
                      <Badge label={task.priority} variant={priorityVariantOrbit[task.priority]} />
                      {task.estimatedMinutes && <span className="text-video-title text-text-tertiary">{task.estimatedMinutes}m</span>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              variant="neutral"
              size="small"
              iconStart={<Plus size={16} />}
              onClick={() => navigate('/tasks')}
            >
              Add task
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}