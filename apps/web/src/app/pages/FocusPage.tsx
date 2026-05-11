import { useState, useEffect, useRef } from 'react';
import { Button, Badge, SelectField, Tooltip } from '@figma/astraui';
import { Play, Pause, RotateCcw, CheckCircle2, Coffee, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useReward } from '../RewardSystem';

const TASKS = [
  { value: '1', label: 'Review project proposal (~30 min)' },
  { value: '2', label: 'Reply to team Slack messages (~15 min)' },
  { value: '3', label: 'Update sprint task list (~20 min)' },
  { value: '5', label: 'Read 10 pages of book (~25 min)' },
];

const DURATIONS = [
  { value: '10', label: '10 minutes' },
  { value: '15', label: '15 minutes' },
  { value: '20', label: '20 minutes' },
  { value: '25', label: '25 minutes (Pomodoro)' },
  { value: '45', label: '45 minutes' },
];

const ENERGY_LEVELS = [
  { value: '1', label: '😴 Very Low' },
  { value: '2', label: '😐 Low' },
  { value: '3', label: '😊 Medium' },
  { value: '4', label: '⚡ High' },
  { value: '5', label: '🔥 Very High' },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const CARD_PURPLE = {
  background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
  border: '1px solid rgba(82,80,243,0.25)',
};
const CARD_TEAL = {
  background: 'linear-gradient(145deg, #031a17 0%, #021210 100%)',
  border: '1px solid rgba(13,148,136,0.25)',
};
const CARD_AMBER = {
  background: 'linear-gradient(145deg, #1a0e00 0%, #110900 100%)',
  border: '1px solid rgba(217,119,6,0.25)',
};

export function FocusPage() {
  const { triggerReward } = useReward();
  const [selectedTask, setSelectedTask] = useState('1');
  const [durationMinutes, setDurationMinutes] = useState('25');
  const [energyLevel, setEnergyLevel] = useState('3');
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'focus' | 'break' | 'complete'>('setup');
  const [completedSessions, setCompletedSessions] = useState(2);
  const [interruptions, setInterruptions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = parseInt(durationMinutes) * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            setPhase('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, secondsLeft]);

  const handleStart = () => {
    setSecondsLeft(parseInt(durationMinutes) * 60);
    setPhase('focus');
    setIsRunning(true);
    setInterruptions(0);
  };

  const handlePause = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setPhase('setup');
    setSecondsLeft(parseInt(durationMinutes) * 60);
  };

  const handleComplete = () => {
    setCompletedSessions(prev => prev + 1);
    setPhase('break');
    setIsRunning(false);
    setSecondsLeft(5 * 60);
    triggerReward('focus_complete');
  };

  const phaseColor = phase === 'focus'
    ? '#a78bfa'
    : phase === 'complete'
    ? '#6ee7b7'
    : phase === 'break'
    ? '#fcd34d'
    : 'rgba(255,255,255,0.3)';

  return (
    <div className="p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col gap-xs">
        <h1 className="text-title text-text-primary">Focus Session</h1>
        <p className="text-label-sm text-text-secondary">
          Deep work mode · {completedSessions} sessions today
        </p>
      </div>

      <div className="flex gap-xl">
        {/* ── Main Timer ── */}
        <div className="flex-1 flex flex-col gap-xl">

          {/* Timer Card */}
          <div
            className="rounded-corner-lg p-xl flex flex-col items-center gap-xl"
            style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #13122f 60%, #0e1a2f 100%)', border: '1px solid rgba(82,80,243,0.3)', boxShadow: '0 4px 40px rgba(82,80,243,0.12)' }}
          >
            {/* Circular progress */}
            <div className="relative flex items-center justify-center" style={{ width: 240, height: 240 }}>
              <svg className="absolute" width={240} height={240} viewBox="0 0 240 240">
                <circle cx={120} cy={120} r={108} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
                <motion.circle
                  cx={120} cy={120} r={108}
                  fill="none"
                  stroke="url(#timerGrad)"
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 108}`}
                  strokeDashoffset={`${2 * Math.PI * 108 * (1 - progress / 100)}`}
                  transform="rotate(-90 120 120)"
                  transition={{ ease: 'linear', duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#5250f3" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="flex flex-col items-center gap-xs z-10">
                <span className="text-text-primary" style={{ fontSize: 48, fontWeight: 700, fontFamily: 'Atkinson Hyperlegible, sans-serif', color: phaseColor }}>
                  {formatTime(secondsLeft)}
                </span>
                <Badge
                  label={phase === 'setup' ? 'Ready' : phase === 'focus' ? 'Focusing' : phase === 'break' ? 'Break' : 'Complete!'}
                  variant={phase === 'focus' ? 'brand' : phase === 'complete' ? 'success' : phase === 'break' ? 'warning' : 'default'}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-lg">
              {phase === 'setup' && (
                <Button variant="primary" iconStart={<Play size={16} />} onClick={handleStart}>
                  Start Focus
                </Button>
              )}
              {(phase === 'focus' || phase === 'break') && (
                <>
                  <Button variant="neutral" iconStart={<RotateCcw size={16} />} onClick={handleReset}>Reset</Button>
                  <Button variant="primary" iconStart={isRunning ? <Pause size={16} /> : <Play size={16} />} onClick={handlePause}>
                    {isRunning ? 'Pause' : 'Resume'}
                  </Button>
                  {phase === 'focus' && (
                    <Tooltip content="Mark an interruption" position="top">
                      <Button variant="subtle" size="small" onClick={() => setInterruptions(p => p + 1)}>
                        Interrupted ({interruptions})
                      </Button>
                    </Tooltip>
                  )}
                </>
              )}
              {phase === 'complete' && (
                <>
                  <Button variant="neutral" iconStart={<RotateCcw size={16} />} onClick={handleReset}>New session</Button>
                  <Button variant="primary" iconStart={<CheckCircle2 size={16} />} onClick={handleComplete}>Complete task</Button>
                </>
              )}
            </div>

            {phase === 'focus' && (
              <p className="text-label-sm text-text-secondary text-center max-w-xs">
                🔮 You're in the zone, Alex. Orbi's got your back — one step at a time.
              </p>
            )}
            {phase === 'complete' && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-md">
                <CheckCircle2 size={32} className="text-success" />
                <p className="text-label text-text-primary">Session complete! 🎉</p>
                <p className="text-label-sm text-text-secondary">
                  {interruptions === 0 ? 'Zero interruptions — that\'s a win!' : `${interruptions} interruption${interruptions > 1 ? 's' : ''} — still solid work!`}
                </p>
              </motion.div>
            )}
          </div>

          {/* Today's sessions */}
          <div
            className="rounded-corner-lg p-xl flex flex-col gap-lg"
            style={CARD_TEAL}
          >
            <h2 className="text-label text-text-primary">Today's sessions</h2>
            <div className="flex gap-md flex-wrap">
              {[...Array(completedSessions)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-xs">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}>
                    <CheckCircle2 size={16} className="text-white" />
                  </div>
                  <span className="text-label-sm text-text-tertiary">25m</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-xs opacity-40">
                <div className="w-10 h-10 rounded-full border-2 border-dashed" style={{ borderColor: 'rgba(82,80,243,0.4)' }} />
                <span className="text-label-sm text-text-tertiary">next</span>
              </div>
            </div>
            <p className="text-label-sm text-text-secondary">
              <Zap size={14} className="inline text-warning mr-xs" />
              Total focus: {completedSessions * 25} minutes today
            </p>
          </div>
        </div>

        {/* ── Settings Panel ── */}
        <div className="w-[280px] flex flex-col gap-xl">
          <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={CARD_PURPLE}>
            <h2 className="text-label text-text-primary">Session setup</h2>
            <SelectField label="Task to focus on" options={TASKS} value={selectedTask} onChange={setSelectedTask} disabled={phase === 'focus'} />
            <SelectField
              label="Duration"
              options={DURATIONS}
              value={durationMinutes}
              onChange={(val) => { setDurationMinutes(val); if (phase === 'setup') setSecondsLeft(parseInt(val) * 60); }}
              disabled={phase === 'focus'}
            />
            <SelectField label="Current energy level" options={ENERGY_LEVELS} value={energyLevel} onChange={setEnergyLevel} />
          </div>

          {/* Tips */}
          <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={CARD_AMBER}>
            <h2 className="text-label text-text-primary">Orbi tips</h2>
            <div className="flex flex-col gap-lg">
              {[
                { icon: Coffee, text: 'Take a 5-min break after each session', color: '#fcd34d' },
                { icon: Zap, text: 'Low energy? Try a 10-min micro-session', color: '#fb923c' },
                { icon: CheckCircle2, text: 'Done early? It counts! Log the session', color: '#6ee7b7' },
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-md">
                  <tip.icon size={16} style={{ color: tip.color }} className="mt-xs flex-shrink-0" />
                  <p className="text-label-sm text-text-secondary">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}