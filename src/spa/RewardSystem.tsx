import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RewardType =
  | 'task_added'
  | 'task_completed'
  | 'all_needs_done'
  | 'all_wants_done'
  | 'all_tasks_done'
  | 'med_taken'
  | 'full_week_med'
  | 'focus_complete'
  | 'focus_session'
  | 'day_streak'
  | 'level_up';

interface RewardConfig {
  messages: string[];
  xp: number;
  icon: string;
  big: boolean;
  color: string;
  bg: string;
  border: string;
  confetti: boolean;
}

interface ActiveToast {
  id: string;
  type: RewardType;
  message: string;
  xp: number;
  icon: string;
  big: boolean;
  color: string;
  bg: string;
  border: string;
  confetti: boolean;
  levelUp?: { from: string; to: string };
}

// ─── XP / Level config ───────────────────────────────────────────────────────

const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1400, 2500, 4000, 6000];
const LEVEL_NAMES = [
  'Rookie Orbiter',
  'Task Starter',
  'Momentum Builder',
  'Focus Champion',
  'ADHD Warrior',
  'Orbi Master',
  'Legendary Mind',
  'Transcendent',
];

function getLevelIndex(xp: number) {
  let lvl = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lvl = i;
    else break;
  }
  return lvl;
}

function getLevelProgress(xp: number) {
  const idx = getLevelIndex(xp);
  const start = LEVEL_THRESHOLDS[idx];
  const end = LEVEL_THRESHOLDS[idx + 1] ?? LEVEL_THRESHOLDS[idx] + 2000;
  return Math.min(1, (xp - start) / (end - start));
}

// ─── Reward configs ───────────────────────────────────────────────────────────

const REWARDS: Record<RewardType, RewardConfig> = {
  task_added: {
    xp: 10,
    icon: '⚡',
    big: false,
    color: '#a5b4fc',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #13122f 100%)',
    border: 'rgba(99,102,241,0.5)',
    confetti: false,
    messages: [
      'Planning IS productivity! Writing it down is step one. ⚡',
      'Your brain captured that fast — classic ADHD superpower! 🧠',
      'Just by adding it, you\'ve already started! 🚀',
      'Yes! Getting it out of your head = instant relief! 💭',
      'Task captured. You\'re building momentum! 🌀',
      'Look at you, getting organized! The brain fog fears you. 🔮',
      'That\'s the move — externalise it, own it! ✨',
    ],
  },
  task_completed: {
    xp: 30,
    icon: '🔥',
    big: true,
    color: '#fcd34d',
    bg: 'linear-gradient(135deg, #451a03 0%, #92400e 60%, #b45309 100%)',
    border: 'rgba(217,119,6,0.6)',
    confetti: true,
    messages: [
      'BOOM! You did that! 🔥',
      'That\'s what I\'m talking about! Task CRUSHED! 💪',
      'One down! Your ADHD brain is absolutely cooking! ✨',
      'You showed up and DELIVERED! 🏆',
      'Tasks fear you! 🌟',
      'Done and DONE. Nothing can stop you now! 🚀',
      'ADHD and WINNING — that\'s your story! 🎯',
      'Tick! That felt amazing, right? It should! 🎉',
      'Another one bites the dust. You\'re on fire! 🔥',
    ],
  },
  all_needs_done: {
    xp: 80,
    icon: '🏆',
    big: true,
    color: '#6ee7b7',
    bg: 'linear-gradient(135deg, #052e16 0%, #065f46 60%, #059669 100%)',
    border: 'rgba(5,150,105,0.6)',
    confetti: true,
    messages: [
      'ALL NEEDS DONE! You are absolutely UNSTOPPABLE today! 🏆',
      'Every single need — HANDLED! Your executive function is peaking! 🌟',
      'TODAY\'S NEEDS: COMPLETE. You showed up for yourself! 💚',
      'The non-negotiables? Negotiated and WON! 🎯',
      'ALL NEEDS CRUSHED! This is your superpower in action! ⚡',
    ],
  },
  all_wants_done: {
    xp: 60,
    icon: '⭐',
    big: true,
    color: '#5eead4',
    bg: 'linear-gradient(135deg, #042f2e 0%, #0f766e 60%, #0d9488 100%)',
    border: 'rgba(13,148,136,0.6)',
    confetti: true,
    messages: [
      'You crushed your wants too? You\'re playing a different game! ⭐',
      'BONUS ROUND COMPLETED! Wants done, life is good! 🌊',
      'Everything you wanted to do today? DONE. Legendary! 🎉',
      'Wants list: obliterated! Who does that? YOU do! 🏄',
    ],
  },
  all_tasks_done: {
    xp: 150,
    icon: '🚀',
    big: true,
    color: '#f9a8d4',
    bg: 'linear-gradient(135deg, #4a044e 0%, #701a75 60%, #a21caf 100%)',
    border: 'rgba(162,28,175,0.6)',
    confetti: true,
    messages: [
      'EVERY SINGLE TASK DONE! YOU ARE LEGENDARY! 🚀',
      'A PERFECT DAY! Needs, wants, everything! Pure LEGEND! 👑',
      'COMPLETE SWEEP! Your brain is a productivity machine today! ⚡',
    ],
  },
  med_taken: {
    xp: 25,
    icon: '💊',
    big: false,
    color: '#86efac',
    bg: 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)',
    border: 'rgba(5,150,105,0.5)',
    confetti: false,
    messages: [
      'You took care of yourself — that\'s self-love in action! 💚',
      'Medication taken! Your future self thanks you! 💊',
      'Self-care IS productivity! You showed up for YOU! 🌿',
      'Checked in on your health today — that\'s a real win! ✅',
      'You remembered! That matters more than you know! 💙',
    ],
  },
  full_week_med: {
    xp: 200,
    icon: '💎',
    big: true,
    color: '#a5f3fc',
    bg: 'linear-gradient(135deg, #082f49 0%, #0c4a6e 60%, #0369a1 100%)',
    border: 'rgba(14,165,233,0.6)',
    confetti: true,
    messages: [
      'FULL WEEK OF MEDICATION! 7 for 7! You are a champion of self-care! 💎',
      'Perfect medication week! Showing up for your brain every single day! 🏆',
      '7 DAYS STRAIGHT! Your consistency is breathtaking! ✨',
    ],
  },
  focus_complete: {
    xp: 40,
    icon: '🧠',
    big: true,
    color: '#c4b5fd',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4338ca 100%)',
    border: 'rgba(99,102,241,0.6)',
    confetti: true,
    messages: [
      'FOCUS SESSION COMPLETE! Your concentration is ELITE! 🧠',
      'Deep work DONE! That\'s real executive function at work! ⚡',
      'You stayed in the zone! Zero shame for any interruptions — you did it! 🎯',
      'Focus unlocked! Every minute of that counted! 🔮',
      'Session complete! Your future self will thank you for this! 🚀',
    ],
  },
  focus_session: {
    xp: 40,
    icon: '🧠',
    big: true,
    color: '#c4b5fd',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 60%, #4338ca 100%)',
    border: 'rgba(99,102,241,0.6)',
    confetti: true,
    messages: [
      'FOCUS SESSION COMPLETE! Your concentration is ELITE! 🧠',
      'Deep work DONE! That\'s real executive function at work! ⚡',
      'You stayed in the zone! Zero shame for any interruptions — you did it! 🎯',
      'Focus unlocked! Every minute of that counted! 🔮',
    ],
  },
  day_streak: {
    xp: 30,
    icon: '🔥',
    big: false,
    color: '#fcd34d',
    bg: 'linear-gradient(135deg, #431407 0%, #92400e 100%)',
    border: 'rgba(217,119,6,0.5)',
    confetti: false,
    messages: [
      'Day streak extended! Consistency is your superpower! 🔥',
      'Another day, another win! You keep showing up! 🌅',
      'STREAK ALIVE! Your brain loves this rhythm! 🧠',
    ],
  },
  level_up: {
    xp: 0,
    icon: '🌟',
    big: true,
    color: '#fde68a',
    bg: 'linear-gradient(135deg, #451a03 0%, #7c3aed 50%, #0d9488 100%)',
    border: 'rgba(253,230,138,0.6)',
    confetti: true,
    messages: [
      'LEVEL UP! You\'re growing every single day! 🌟',
      'NEW LEVEL UNLOCKED! Your ADHD brain is levelling up! 🚀',
      'POWER SURGE! You just levelled up! 🔥',
    ],
  },
};

// ─── Confetti Canvas ──────────────────────────────────────────────────────────

function ConfettiCanvas({ id }: { id: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#a78bfa', '#5eead4', '#fcd34d', '#fb923c', '#f472b6', '#6ee7b7', '#818cf8', '#38bdf8', '#4ade80'];
    const ox = canvas.width / 2;
    const oy = canvas.height * 0.35;

    type Particle = {
      x: number; y: number; vx: number; vy: number;
      color: string; w: number; h: number;
      rotation: number; rotationSpeed: number; opacity: number;
    };

    const particles: Particle[] = Array.from({ length: 80 }, () => ({
      x: ox + (Math.random() - 0.5) * 120,
      y: oy + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 18,
      vy: -(Math.random() * 14 + 6),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      opacity: 1,
    }));

    let frameId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        if (p.opacity <= 0.01) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.016;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (alive) frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [id]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9998 }}
    />
  );
}

// ─── Toast component ──────────────────────────────────────────────────────────

function RewardToast({ toast, onDismiss }: { toast: ActiveToast; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, toast.big ? 4200 : 3000);
    return () => clearTimeout(t);
  }, [toast.id]);

  if (toast.big) {
    return (
      <motion.div
        key={toast.id}
        initial={{ opacity: 0, scale: 0.7, y: -30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        className="fixed left-1/2 -translate-x-1/2 flex flex-col items-center gap-md px-2xl py-xl rounded-corner-lg"
        style={{
          top: 28,
          zIndex: 9999,
          background: toast.bg,
          border: `2px solid ${toast.border}`,
          boxShadow: `0 8px 60px ${toast.border}, 0 0 0 1px rgba(255,255,255,0.06)`,
          minWidth: 340,
          maxWidth: 480,
          textAlign: 'center',
        }}
      >
        {/* Level up badge */}
        {toast.levelUp && (
          <div
            className="px-lg py-xs rounded-corner-full text-label-sm"
            style={{ background: 'rgba(255,255,255,0.12)', color: toast.color, border: `1px solid ${toast.border}` }}
          >
            {toast.levelUp.from} → {toast.levelUp.to}
          </div>
        )}

        {/* Pulsing icon */}
        <motion.span
          style={{ fontSize: '2.8rem', lineHeight: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
        >
          {toast.icon}
        </motion.span>

        <div className="flex flex-col gap-xs">
          <p className="text-text-primary" style={{ fontSize: '1.15rem', fontWeight: 700, color: toast.color }}>
            {toast.message}
          </p>
          <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            +{toast.xp} XP earned
          </p>
        </div>

        {/* XP pulse bar */}
        <motion.div
          className="rounded-full"
          style={{ height: 4, background: toast.color, opacity: 0.5, width: '100%', transformOrigin: '100% 50%' }}
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.big ? 4.2 : 3, ease: 'linear' }}
        />

        <button
          onClick={onDismiss}
          className="absolute top-md right-md text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <X size={14} />
        </button>
      </motion.div>
    );
  }

  // Small toast — bottom-right stack
  return (
    <motion.div
      key={toast.id}
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 350, damping: 26 }}
      className="flex items-center gap-md px-lg py-md rounded-corner-md cursor-pointer"
      style={{
        background: toast.bg,
        border: `1px solid ${toast.border}`,
        boxShadow: `0 4px 24px ${toast.border}`,
        maxWidth: 340,
      }}
      onClick={onDismiss}
    >
      <span style={{ fontSize: '1.4rem' }}>{toast.icon}</span>
      <div className="flex flex-col gap-xs flex-1">
        <p className="text-label-sm text-text-primary">{toast.message}</p>
        <p style={{ fontSize: '0.75rem', color: toast.color }}>+{toast.xp} XP</p>
      </div>
    </motion.div>
  );
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface RewardContextValue {
  triggerReward: (type: RewardType, opts?: { levelUpInfo?: { from: string; to: string } }) => void;
  xp: number;
  levelIndex: number;
  levelName: string;
  levelProgress: number;
  nextLevelName: string;
  xpToNextLevel: number;
}

const RewardContext = createContext<RewardContextValue | null>(null);

export function useReward() {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error('useReward must be used inside <RewardProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RewardProvider({ children }: { children: ReactNode }) {
  const [xp, setXp] = useState<number>(() => {
    try { return parseInt(localStorage.getItem('orbi-xp') ?? '0', 10) || 0; }
    catch { return 0; }
  });

  const [bigToast, setBigToast] = useState<ActiveToast | null>(null);
  const [smallToasts, setSmallToasts] = useState<ActiveToast[]>([]);
  const [confettiKey, setConfettiKey] = useState<string | null>(null);

  const queueRef = useRef<Array<{ type: RewardType; xpGain: number; toast: Omit<ActiveToast, 'id'> }>>([]);
  const processingRef = useRef(false);

  const processQueue = useCallback(() => {
    if (processingRef.current || queueRef.current.length === 0) return;
    const item = queueRef.current.shift()!;
    processingRef.current = true;

    const id = `${Date.now()}-${Math.random()}`;
    const full: ActiveToast = { ...item.toast, id };

    if (item.toast.big) {
      setBigToast(full);
      if (item.toast.confetti) setConfettiKey(id);
    } else {
      setSmallToasts(prev => [...prev.slice(-2), full]);
    }

    // Bump XP
    setXp(prev => {
      const next = prev + item.xpGain;
      try { localStorage.setItem('orbi-xp', String(next)); } catch { /* ignore */ }
      return next;
    });

    setTimeout(() => {
      processingRef.current = false;
      processQueue();
    }, item.toast.big ? 1200 : 400);
  }, []);

  const triggerReward = useCallback((type: RewardType, opts?: { levelUpInfo?: { from: string; to: string } }) => {
    const cfg = REWARDS[type];
    const msg = cfg.messages[Math.floor(Math.random() * cfg.messages.length)];

    queueRef.current.push({
      type,
      xpGain: cfg.xp,
      toast: {
        type,
        message: msg,
        xp: cfg.xp,
        icon: cfg.icon,
        big: cfg.big,
        color: cfg.color,
        bg: cfg.bg,
        border: cfg.border,
        confetti: cfg.confetti,
        levelUp: opts?.levelUpInfo,
      },
    });

    processQueue();
  }, [processQueue]);

  // Check for level up whenever XP changes
  const prevLevelRef = useRef(getLevelIndex(xp));
  useEffect(() => {
    const newLevel = getLevelIndex(xp);
    if (newLevel > prevLevelRef.current) {
      const from = LEVEL_NAMES[prevLevelRef.current];
      const to = LEVEL_NAMES[newLevel];
      prevLevelRef.current = newLevel;
      // Fire level up reward
      setTimeout(() => triggerReward('level_up', { levelUpInfo: { from, to } }), 800);
    }
  }, [xp, triggerReward]);

  const levelIndex = getLevelIndex(xp);
  const levelName = LEVEL_NAMES[levelIndex];
  const nextLevelName = LEVEL_NAMES[Math.min(levelIndex + 1, LEVEL_NAMES.length - 1)];
  const levelProgress = getLevelProgress(xp);
  const nextThreshold = LEVEL_THRESHOLDS[levelIndex + 1] ?? LEVEL_THRESHOLDS[levelIndex] + 2000;
  const xpToNextLevel = nextThreshold - xp;

  return (
    <RewardContext.Provider value={{ triggerReward, xp, levelIndex, levelName, levelProgress, nextLevelName, xpToNextLevel }}>
      {children}

      {/* Confetti canvas */}
      <AnimatePresence>
        {confettiKey && <ConfettiCanvas key={confettiKey} id={confettiKey} />}
      </AnimatePresence>

      {/* Big toast (top-center) */}
      <AnimatePresence>
        {bigToast && (
          <RewardToast
            key={bigToast.id}
            toast={bigToast}
            onDismiss={() => { setBigToast(null); setConfettiKey(null); }}
          />
        )}
      </AnimatePresence>

      {/* Small toasts (bottom-right stack) */}
      <div
        className="fixed flex flex-col gap-sm"
        style={{ bottom: 24, right: 24, zIndex: 9999 }}
      >
        <AnimatePresence initial={false}>
          {smallToasts.map(t => (
            <RewardToast
              key={t.id}
              toast={t}
              onDismiss={() => setSmallToasts(prev => prev.filter(x => x.id !== t.id))}
            />
          ))}
        </AnimatePresence>
      </div>
    </RewardContext.Provider>
  );
}

// ─── XP Stats Card (used in Dashboard) ───────────────────────────────────────

export function XPStatsCard() {
  const { xp, levelName, levelProgress, nextLevelName, xpToNextLevel, levelIndex } = useReward();

  const LEVEL_COLORS = [
    { from: '#3730a3', to: '#5250f3' },
    { from: '#1e3a5f', to: '#2563eb' },
    { from: '#0f766e', to: '#14b8a6' },
    { from: '#065f46', to: '#059669' },
    { from: '#92400e', to: '#d97706' },
    { from: '#7c3aed', to: '#a855f7' },
    { from: '#701a75', to: '#c026d3' },
    { from: '#4a044e', to: '#7c3aed' },
  ];
  const col = LEVEL_COLORS[Math.min(levelIndex, LEVEL_COLORS.length - 1)];

  return (
    <motion.div
      className="rounded-corner-lg p-xl flex flex-col gap-lg"
      style={{
        background: `linear-gradient(145deg, ${col.from} 0%, ${col.to} 100%)`,
        border: `1px solid ${col.to}88`,
        boxShadow: `0 4px 32px ${col.to}44`,
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-xs">
          <span className="text-label text-white">{levelName}</span>
          <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {xp.toLocaleString()} XP total
          </span>
        </div>
        <motion.div
          className="flex items-center justify-center rounded-full"
          style={{
            width: 44, height: 44,
            background: 'rgba(255,255,255,0.15)',
            border: '2px solid rgba(255,255,255,0.3)',
            fontSize: '1.4rem',
          }}
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          🌟
        </motion.div>
      </div>

      {/* XP Progress bar */}
      <div className="flex flex-col gap-sm">
        <div className="rounded-full overflow-hidden" style={{ height: 8, background: 'rgba(0,0,0,0.3)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'rgba(255,255,255,0.7)' }}
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress * 100}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            {xpToNextLevel} XP to next level
          </span>
          <span className="text-label-sm" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>
            Next: {nextLevelName}
          </span>
        </div>
      </div>

      {/* Micro affirmation */}
      <p className="text-label-sm" style={{ color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
        {xp === 0
          ? 'Complete actions to earn XP and level up! ⚡'
          : xp < 100
          ? 'Great start! Keep going — you\'re building momentum! 🚀'
          : xp < 300
          ? 'You\'re growing! Every task makes you stronger! 💪'
          : xp < 700
          ? 'Momentum is building! Your consistency is showing! 🔥'
          : 'You\'re in elite territory. Your ADHD brain is thriving! 🌟'}
      </p>
    </motion.div>
  );
}