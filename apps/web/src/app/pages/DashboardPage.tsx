import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Badge, Button, InputField, Tooltip } from '@figma/astraui';
import {
  CheckCircle2, Clock, Flame, Zap, Plus, ArrowRight, Bot,
  Timer, Bell, CalendarDays, Sparkles, Target, Brain,
} from 'lucide-react';
import { motion } from 'motion/react';
import { XPStatsCard } from '../RewardSystem';
import { useOrbiProfile } from '../OrbiProfileContext';
import { useAuth } from '../../context/AuthContext';

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

const MOCK_TASKS = [
  { id: '1', title: 'Review project proposal', priority: 'urgent', status: 'in_progress', estimatedMinutes: 30 },
  { id: '2', title: 'Reply to team Slack messages', priority: 'high', status: 'pending', estimatedMinutes: 15 },
  { id: '3', title: 'Update task list for next sprint', priority: 'medium', status: 'pending', estimatedMinutes: 20 },
  { id: '4', title: 'Take medication reminder', priority: 'urgent', status: 'complete', estimatedMinutes: 5 },
  { id: '5', title: 'Read 10 pages of current book', priority: 'low', status: 'pending', estimatedMinutes: 25 },
];

const ORBIT_TASKS = MOCK_TASKS.slice(0, 4);

const priorityVariant: Record<string, 'danger' | 'warning' | 'default' | 'secondary'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
};

const ORBIT_ANGLES = [0, 90, 180, 270];
const NEW_USER_PROMPT_KEY_PREFIX = 'orbi-new-user-profile-prompted';
const GUEST_ACCOUNT_KEY = 'guest';

function isProfileMissingRequired(profile: ReturnType<typeof useOrbiProfile>['profile']) {
  return !profile.preferredName.trim() || !profile.jobTitle.trim() || !profile.currentFocus.trim();
}

const STAT_CARDS = [
  {
    icon: CheckCircle2,
    label: 'Done today',
    getValue: (v: number) => `${v} task`,
    gradient: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #059669 100%)',
    iconColor: '#6ee7b7',
    glowColor: 'rgba(5,150,105,0.35)',
  },
  {
    icon: Clock,
    label: 'Focus time',
    getValue: (v: number) => `${v} min`,
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #5250f3 100%)',
    iconColor: '#c4b5fd',
    glowColor: 'rgba(82,80,243,0.35)',
  },
  {
    icon: Flame,
    label: 'Day streak',
    getValue: (v: number) => `${v} days`,
    gradient: 'linear-gradient(135deg, #431407 0%, #92400e 60%, #d97706 100%)',
    iconColor: '#fcd34d',
    glowColor: 'rgba(217,119,6,0.35)',
  },
  {
    icon: Zap,
    label: 'Energy',
    getValue: (_v: number) => 'Medium',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 60%, #14b8a6 100%)',
    iconColor: '#5eead4',
    glowColor: 'rgba(20,184,166,0.35)',
  },
];

const QUICK_ACTIONS = [
  {
    label: 'Focus 25min',
    icon: Timer,
    path: '/focus',
    gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    glow: 'rgba(124,58,237,0.4)',
  },
  {
    label: 'Ask Orbi',
    icon: Bot,
    path: '/agent',
    gradient: 'linear-gradient(135deg, #0891b2, #0d9488)',
    glow: 'rgba(13,148,136,0.4)',
  },
  {
    label: 'Reminders',
    icon: Bell,
    path: '/reminders',
    gradient: 'linear-gradient(135deg, #d97706, #ea580c)',
    glow: 'rgba(234,88,12,0.4)',
  },
  {
    label: 'Calendar',
    icon: CalendarDays,
    path: '/calendar',
    gradient: 'linear-gradient(135deg, #059669, #0891b2)',
    glow: 'rgba(8,145,178,0.4)',
  },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, isOnboarded, updateProfile } = useOrbiProfile();
  const [completedToday] = useState(1);
  const focusMinutes = 47;
  const streak = 4;
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [promptName, setPromptName] = useState(profile.preferredName);
  const [promptRole, setPromptRole] = useState(profile.jobTitle);
  const [promptFocus, setPromptFocus] = useState(profile.currentFocus);

  const statValues = [completedToday, focusMinutes, streak, 0];
  const accountKey = user?._id || user?.email || GUEST_ACCOUNT_KEY;
  const newUserPromptKey = `${NEW_USER_PROMPT_KEY_PREFIX}:${accountKey}`;
  const todayLabel = new Intl.DateTimeFormat('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  useEffect(() => {
    const alreadyPrompted = localStorage.getItem(newUserPromptKey) === 'true';
    if (!alreadyPrompted && isProfileMissingRequired(profile)) {
      setPromptName(profile.preferredName);
      setPromptRole(profile.jobTitle);
      setPromptFocus(profile.currentFocus);
      setShowProfilePrompt(true);
      return;
    }

    setShowProfilePrompt(false);
  }, [newUserPromptKey, profile]);

  function finishPrompt() {
    localStorage.setItem(newUserPromptKey, 'true');
    setShowProfilePrompt(false);
  }

  function savePromptProfile() {
    updateProfile({
      preferredName: promptName.trim(),
      jobTitle: promptRole.trim(),
      currentFocus: promptFocus.trim(),
    });
    finishPrompt();
  }

  const greeting = profile.preferredName ? `Good afternoon, ${profile.preferredName} ✦` : 'Good afternoon ✦';

  return (
    <div className="p-xl flex flex-col gap-lg min-h-full">
      {showProfilePrompt && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-xl rounded-corner-lg border border-white/10 bg-surface-bg p-6 shadow-2xl"
          >
            <h2 className="text-heading text-text-primary">One-time setup for new users</h2>
            <p className="text-label-sm text-text-secondary mt-1 mb-4">
              Fill this once so Orbi can personalize your dashboard and coaching.
            </p>

            <div className="grid gap-4">
              <InputField
                label="Preferred name"
                value={promptName}
                placeholder="How should Orbi address you?"
                onChange={setPromptName}
              />
              <InputField
                label="Job or role"
                value={promptRole}
                placeholder="Designer, student, founder..."
                onChange={setPromptRole}
              />
              <InputField
                label="Current focus"
                value={promptFocus}
                placeholder="What are you trying to get done right now?"
                onChange={setPromptFocus}
              />
            </div>

            <div className="flex gap-3 mt-5">
              <Button
                variant="primary"
                onClick={savePromptProfile}
                disabled={!promptName.trim() || !promptRole.trim() || !promptFocus.trim()}
              >
                Save profile
              </Button>
              <Button variant="neutral" onClick={finishPrompt}>Not now</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Onboarding nudge ── */}
      {!isOnboarded && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-corner-lg px-xl py-lg flex items-center gap-lg cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(82,80,243,0.2), rgba(13,148,136,0.12))',
            border: '1.5px solid rgba(82,80,243,0.4)',
          }}
          onClick={() => navigate('/onboarding')}
        >
          <div className="p-md rounded-corner-md flex-shrink-0" style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}>
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
          <p className="text-label-sm" style={{ color: '#a78bfa' }}>
            {todayAffirmation}
          </p>
          <p className="text-label-sm text-text-tertiary">
            {todayLabel} · Orbi Full Plan
          </p>
        </div>

        <div className="flex items-center gap-md">
          {/* Orbi button — gradient so it never disappears into the bg */}
          <motion.button
            className="flex items-center gap-sm px-lg py-md rounded-corner-md text-white cursor-pointer border-0 outline-none"
            style={{
              background: 'linear-gradient(135deg, #5250f3 0%, #0d9488 100%)',
              boxShadow: '0 0 18px rgba(82,80,243,0.5), 0 0 6px rgba(13,148,136,0.4)',
            }}
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(82,80,243,0.7), 0 0 10px rgba(13,148,136,0.5)' }}
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

      {/* ── Gradient Stat Cards ── */}
      <div className="grid grid-cols-4 gap-lg">
        {STAT_CARDS.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="rounded-corner-lg p-lg flex items-center gap-md"
            style={{
              background: stat.gradient,
              boxShadow: `0 4px 24px ${stat.glowColor}`,
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
          >
            <div
              className="flex-shrink-0 p-md rounded-corner-md"
              style={{ background: 'rgba(255,255,255,0.12)' }}
            >
              <stat.icon size={20} style={{ color: stat.iconColor }} />
            </div>
            <div className="flex flex-col gap-xs">
              <span className="text-video-title" style={{ color: 'rgba(255,255,255,0.65)' }}>
                {stat.label}
              </span>
              <span className="text-label text-white">
                {stat.getValue(statValues[i])}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Row: Orbital + Right Panel ── */}
      <div className="flex gap-lg flex-1 min-h-0">

        {/* ── Left: Orbital + Quick Actions ── */}
        <div className="flex flex-col gap-lg flex-1 min-w-0">

          {/* Orbital visualization */}
          <div
            className="rounded-corner-lg p-xl flex flex-col gap-lg flex-1"
            style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #13122f 60%, #0e1f2f 100%)', border: '1px solid rgba(82,80,243,0.25)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-md">
                <Target size={16} style={{ color: '#a78bfa' }} />
                <h2 className="text-label text-text-primary">Focus Orbit</h2>
              </div>
              <Badge label="4 orbiting" variant="brand" />
            </div>

            <div className="flex-1 flex items-center justify-center relative" style={{ minHeight: 280 }}>
              {/* Orbit rings */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 240, height: 240,
                  border: '1px solid rgba(82,80,243,0.3)',
                  boxShadow: 'inset 0 0 40px rgba(82,80,243,0.05)',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 320, height: 320,
                  border: '1px dashed rgba(13,148,136,0.2)',
                }}
              />

              {/* Pulsing center node */}
              <motion.div
                className="absolute z-10 flex flex-col items-center justify-center rounded-full"
                style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, #5250f3, #0d9488)',
                }}
                animate={{
                  boxShadow: [
                    '0 0 0 0px rgba(82,80,243,0.5)',
                    '0 0 0 20px rgba(82,80,243,0)',
                    '0 0 0 0px rgba(82,80,243,0)',
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
                            : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${task.status === 'complete' ? 'rgba(5,150,105,0.5)' : 'rgba(82,80,243,0.4)'}`,
                          backdropFilter: 'blur(4px)',
                        }}
                        onClick={() => navigate('/tasks')}
                      >
                        <p className="text-video-title text-text-primary truncate">{task.title}</p>
                        <Badge label={task.priority} variant={priorityVariant[task.priority]} />
                      </div>
                    </Tooltip>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions — fills the space below the orbital */}
          <div className="grid grid-cols-4 gap-md">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.button
                key={action.label}
                className="rounded-corner-lg p-lg flex flex-col items-center gap-md cursor-pointer border-0 text-white"
                style={{
                  background: action.gradient,
                  boxShadow: `0 4px 20px ${action.glow}`,
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.06 }}
                whileHover={{ scale: 1.06, boxShadow: `0 8px 32px ${action.glow}` }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(action.path)}
              >
                <action.icon size={22} />
                <span className="text-video-title text-white">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex flex-col gap-lg w-[300px] flex-shrink-0">

          {/* XP / Level card */}
          <XPStatsCard />

          {/* Orbi AI Suggestion — gradient card so it stands out */}
          <motion.div
            className="rounded-corner-lg p-xl flex flex-col gap-lg"
            style={{
              background: 'linear-gradient(145deg, #1e1b4b 0%, #1a2e3b 100%)',
              border: '1px solid rgba(82,80,243,0.4)',
              boxShadow: '0 4px 32px rgba(82,80,243,0.2)',
            }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex items-center gap-md">
              <div
                className="p-sm rounded-corner-md"
                style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}
              >
                <Bot size={14} className="text-white" />
              </div>
              <span className="text-label text-text-primary">Orbi says</span>
              <Badge label="Agent" variant="brand" />
            </div>
            <p className="text-label-sm text-text-secondary">
              "Hey {profile.preferredName || 'there'}! You've got the proposal review as your top priority.
              Want me to break it into smaller steps? Starting small reduces ADHD task paralysis. 🔮"
            </p>
            <button
              className="flex items-center justify-center gap-sm px-md py-sm rounded-corner-md text-white cursor-pointer border-0"
              style={{ background: 'linear-gradient(135deg, #5250f3 0%, #0d9488 100%)' }}
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
              background: 'linear-gradient(145deg, #0f0e2a 0%, #0e1a0e 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-label text-text-primary">Today's tasks</h2>
              <Button variant="subtle" size="small" onClick={() => navigate('/tasks')}>
                View all
              </Button>
            </div>

            <div className="flex flex-col gap-sm flex-1">
              {MOCK_TASKS.map((task) => (
                <motion.div
                  key={task.id}
                  className="flex items-center gap-md px-md py-sm rounded-corner-md cursor-pointer transition-all"
                  style={{
                    background: task.status === 'complete'
                      ? 'rgba(5,150,105,0.08)'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${task.status === 'complete' ? 'rgba(5,150,105,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    opacity: task.status === 'complete' ? 0.65 : 1,
                  }}
                  whileHover={{ background: 'rgba(82,80,243,0.12)', borderColor: 'rgba(82,80,243,0.3)' }}
                  onClick={() => navigate('/tasks')}
                >
                  <div
                    className="flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{
                      borderColor: task.status === 'complete' ? '#059669' : 'rgba(255,255,255,0.25)',
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
                      <Badge label={task.priority} variant={priorityVariant[task.priority]} />
                      <span className="text-video-title text-text-tertiary">{task.estimatedMinutes}m</span>
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