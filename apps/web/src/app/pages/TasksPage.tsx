import { useState, useRef, useCallback } from 'react';
import { Badge, Button } from '@figma/astraui';
import { Plus, CheckCircle2, Trash2, Star, Flame, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useReward } from '../RewardSystem';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  done: boolean;
}

const priorityVariant: Record<Priority, 'danger' | 'warning' | 'default' | 'secondary'> = {
  urgent: 'danger',
  high: 'warning',
  medium: 'default',
  low: 'secondary',
};

const PRIORITY_OPTIONS: Priority[] = ['urgent', 'high', 'medium', 'low'];

const SEED_NEEDS: Task[] = [
  { id: 'n1', title: 'Review project proposal', priority: 'urgent', done: false },
  { id: 'n2', title: 'Take medication', priority: 'urgent', done: true },
  { id: 'n3', title: 'Reply to team Slack messages', priority: 'high', done: false },
];

const SEED_WANTS: Task[] = [
  { id: 'w1', title: 'Read 10 pages of current book', priority: 'medium', done: false },
  { id: 'w2', title: 'Plan next week sprint', priority: 'low', done: false },
];

function TaskCard({
  task,
  onToggle,
  onDelete,
  accent,
}: {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  accent: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: task.done ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-corner-md p-lg flex items-center gap-lg"
      style={{
        background: task.done
          ? 'linear-gradient(145deg, #031a0e 0%, #020e08 100%)'
          : 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
        border: `1px solid ${task.done ? 'rgba(5,150,105,0.3)' : accent}`,
      }}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
        style={{
          borderColor: task.done ? '#059669' : 'rgba(255,255,255,0.2)',
          background: task.done ? '#059669' : 'transparent',
        }}
        aria-label="Toggle complete"
      >
        {task.done && <CheckCircle2 size={13} className="text-white" />}
      </button>

      <span
        className={`flex-1 text-text-primary ${task.done ? 'line-through text-text-tertiary' : ''}`}
        style={{ fontSize: '1rem' }}
      >
        {task.title}
      </span>

      <Badge label={task.priority} variant={priorityVariant[task.priority]} />

      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 text-text-tertiary hover:text-red-400 transition-colors"
        aria-label="Delete task"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}

function TaskColumn({
  title,
  subtitle,
  icon: Icon,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  gradient,
  border,
  accent,
  placeholder,
}: {
  title: string;
  subtitle: string;
  icon: typeof Flame;
  tasks: Task[];
  onAdd: (title: string, priority: Priority) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  gradient: string;
  border: string;
  accent: string;
  placeholder: string;
}) {
  const [input, setInput] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!input.trim()) return;
    onAdd(input.trim(), priority);
    setInput('');
    inputRef.current?.focus();
  };

  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;

  return (
    <div
      className="flex-1 flex flex-col gap-lg rounded-corner-lg p-xl"
      style={{ background: gradient, border }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-md">
            <Icon size={20} style={{ color: accent }} />
            <h2 className="text-label text-text-primary">{title}</h2>
          </div>
          <p className="text-label-sm text-text-secondary">{subtitle}</p>
        </div>
        <div className="flex items-center gap-sm">
          <span className="text-label-sm" style={{ color: accent }}>{done}/{total} done</span>
          {total > 0 && (
            <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-1.5 rounded-full transition-all"
                style={{ width: `${total ? (done / total) * 100 : 0}%`, background: accent }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div
        className="rounded-corner-md p-md flex flex-col gap-md"
        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex gap-md items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-tertiary"
            style={{ fontSize: '1rem', fontFamily: 'Atkinson Hyperlegible, sans-serif' }}
          />
          <button
            onClick={handleAdd}
            className="flex-shrink-0 flex items-center justify-center rounded-corner-md w-8 h-8 transition-all"
            style={{ background: accent + '33', border: `1px solid ${accent}60` }}
          >
            <Plus size={16} style={{ color: accent }} />
          </button>
        </div>
        <div className="flex gap-sm items-center">
          <span className="text-label-sm text-text-tertiary">Priority:</span>
          {PRIORITY_OPTIONS.map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className="px-sm py-xs rounded-corner-sm text-label-sm capitalize transition-all"
              style={{
                background: priority === p ? accent + '33' : 'transparent',
                border: `1px solid ${priority === p ? accent : 'rgba(255,255,255,0.1)'}`,
                color: priority === p ? accent : 'rgba(255,255,255,0.5)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="flex flex-col gap-md flex-1">
        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-md py-2xl text-center"
            >
              <Icon size={28} style={{ color: accent, opacity: 0.4 }} />
              <p className="text-label-sm text-text-tertiary">
                Nothing here yet — add your first one!
              </p>
            </motion.div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                accent={accent}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TasksPage() {
  const { triggerReward } = useReward();
  const [needs, setNeeds] = useState<Task[]>(SEED_NEEDS);
  const [wants, setWants] = useState<Task[]>(SEED_WANTS);

  const addTask = useCallback((list: 'needs' | 'wants') => (title: string, priority: Priority) => {
    const newTask: Task = { id: Date.now().toString(), title, priority, done: false };
    if (list === 'needs') setNeeds(p => [newTask, ...p]);
    else setWants(p => [newTask, ...p]);
    // Reward for capturing a task
    triggerReward('task_added');
  }, [triggerReward]);

  const toggleTask = useCallback((list: 'needs' | 'wants') => (id: string) => {
    if (list === 'needs') {
      const task = needs.find(t => t.id === id);
      const wasCompleting = task ? !task.done : false;
      const next = needs.map(t => t.id === id ? { ...t, done: !t.done } : t);
      setNeeds(next);

      if (wasCompleting) {
        triggerReward('task_completed');
        const allNeedsDone = next.every(t => t.done) && next.length > 0;
        if (allNeedsDone) {
          setTimeout(() => {
            triggerReward('all_needs_done');
            if (wants.every(t => t.done) && wants.length > 0) {
              setTimeout(() => triggerReward('all_tasks_done'), 800);
            }
          }, 600);
        }
      }
    } else {
      const task = wants.find(t => t.id === id);
      const wasCompleting = task ? !task.done : false;
      const next = wants.map(t => t.id === id ? { ...t, done: !t.done } : t);
      setWants(next);

      if (wasCompleting) {
        triggerReward('task_completed');
        const allWantsDone = next.every(t => t.done) && next.length > 0;
        if (allWantsDone) {
          setTimeout(() => {
            triggerReward('all_wants_done');
            if (needs.every(t => t.done) && needs.length > 0) {
              setTimeout(() => triggerReward('all_tasks_done'), 800);
            }
          }, 600);
        }
      }
    }
  }, [needs, wants, triggerReward]);

  const deleteTask = useCallback((list: 'needs' | 'wants') => (id: string) => {
    if (list === 'needs') setNeeds(p => p.filter(t => t.id !== id));
    else setWants(p => p.filter(t => t.id !== id));
  }, []);

  const totalDone = [...needs, ...wants].filter(t => t.done).length;
  const totalTasks = needs.length + wants.length;

  return (
    <div className="p-xl flex flex-col gap-xl min-h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">Task Planner</h1>
          <p className="text-label-sm text-text-secondary">
            What do you want to accomplish today, Alex?
          </p>
        </div>
        {/* Progress summary */}
        <div
          className="flex items-center gap-lg px-xl py-lg rounded-corner-lg"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1a2e3b 100%)',
            border: '1px solid rgba(82,80,243,0.3)',
          }}
        >
          <div className="flex flex-col items-center gap-xs">
            <span className="text-title text-white" style={{ lineHeight: 1 }}>{totalDone}</span>
            <span className="text-label-sm text-text-tertiary">done</span>
          </div>
          <ArrowRight size={16} className="text-text-tertiary" />
          <div className="flex flex-col items-center gap-xs">
            <span className="text-title text-white" style={{ lineHeight: 1 }}>{totalTasks}</span>
            <span className="text-label-sm text-text-tertiary">total</span>
          </div>
          {totalTasks > 0 && (
            <>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="flex flex-col items-center gap-xs">
                <span className="text-title" style={{ lineHeight: 1, color: '#a78bfa' }}>
                  {Math.round((totalDone / totalTasks) * 100)}%
                </span>
                <span className="text-label-sm text-text-tertiary">complete</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Orbi tip */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-corner-md px-xl py-lg flex items-center gap-md"
        style={{
          background: 'linear-gradient(135deg, rgba(82,80,243,0.12) 0%, rgba(13,148,136,0.08) 100%)',
          border: '1px solid rgba(82,80,243,0.2)',
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🔮</span>
        <p className="text-label-sm text-text-secondary flex-1">
          <strong className="text-text-primary">Orbi tip:</strong> Add your non-negotiables to{' '}
          <strong style={{ color: '#fb923c' }}>Today's Needs</strong> first — medication, meals, critical deadlines.
          Then fill <strong style={{ color: '#14b8a6' }}>Today's Wants</strong> with things you'd love to do.
          <strong style={{ color: '#a78bfa' }}> Every task you add earns you XP!</strong>
        </p>
      </motion.div>

      {/* Two-column task entry */}
      <div className="flex gap-xl flex-1">
        <TaskColumn
          title="Today's Needs"
          subtitle="Must get done — non-negotiable"
          icon={Flame}
          tasks={needs}
          onAdd={addTask('needs')}
          onToggle={toggleTask('needs')}
          onDelete={deleteTask('needs')}
          gradient="linear-gradient(145deg, #1a0e00 0%, #110900 100%)"
          border="1px solid rgba(251,146,60,0.3)"
          accent="#fb923c"
          placeholder="What MUST happen today? (press Enter to add + earn XP)"
        />
        <TaskColumn
          title="Today's Wants"
          subtitle="Nice to do — no pressure"
          icon={Star}
          tasks={wants}
          onAdd={addTask('wants')}
          onToggle={toggleTask('wants')}
          onDelete={deleteTask('wants')}
          gradient="linear-gradient(145deg, #031a17 0%, #021210 100%)"
          border="1px solid rgba(20,184,166,0.3)"
          accent="#14b8a6"
          placeholder="What would be great to do today? (press Enter to add + earn XP)"
        />
      </div>
    </div>
  );
}