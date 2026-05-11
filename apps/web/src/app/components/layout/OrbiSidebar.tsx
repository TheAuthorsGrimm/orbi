import { useNavigate, useLocation } from 'react-router';
import { Tooltip } from '@figma/astraui';
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  Bot,
  Timer,
  Bell,
  Settings,
  CreditCard,
  Orbit,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';

const NAV_ITEMS: { icon: LucideIcon; label: string; path: string }[] = [
  { icon: LayoutDashboard, label: 'Dashboard',       path: '/dashboard' },
  { icon: ListTodo,        label: 'Task Planner',    path: '/tasks'     },
  { icon: CalendarDays,    label: 'Calendar',        path: '/calendar'  },
  { icon: Bot,             label: 'Orbi AI Agent',   path: '/agent'     },
  { icon: Timer,           label: 'Focus Session',   path: '/focus'     },
  { icon: Bell,            label: 'Reminders',       path: '/reminders' },
];

const FOOTER_ITEMS: { icon: LucideIcon; label: string; path: string }[] = [
  { icon: CreditCard, label: 'Pricing & Plans', path: '/pricing'  },
  { icon: Settings,   label: 'Settings',        path: '/settings' },
];

function NavButton({
  icon: Icon,
  label,
  path,
  active,
}: {
  icon: LucideIcon;
  label: string;
  path: string;
  active: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Tooltip content={label} position="right">
      <motion.button
        onClick={() => navigate(path)}
        className="relative flex items-center justify-center rounded-corner-md cursor-pointer border-0 outline-none"
        style={{ width: 40, height: 40 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.93 }}
        aria-label={label}
      >
        {/* Active gradient background */}
        {active && (
          <motion.div
            className="absolute inset-0 rounded-corner-md"
            style={{
              background: 'linear-gradient(135deg, #5250f3 0%, #0d9488 100%)',
              boxShadow: '0 0 16px rgba(82,80,243,0.6), 0 0 6px rgba(13,148,136,0.4)',
            }}
            layoutId="activePill"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          />
        )}

        {/* Hover background (non-active) */}
        {!active && (
          <motion.div
            className="absolute inset-0 rounded-corner-md opacity-0"
            style={{ background: 'rgba(82,80,243,0.15)' }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        )}

        <Icon
          size={18}
          className="relative z-10"
          style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.45)', strokeWidth: 1.6 }}
        />
      </motion.button>
    </Tooltip>
  );
}

export function OrbiSidebar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className="flex flex-col items-center py-xl gap-sm flex-shrink-0"
      style={{
        width: 64,
        background: 'linear-gradient(180deg, #0f0e2a 0%, #0a0a18 60%, #080e14 100%)',
        borderRight: '1px solid rgba(82,80,243,0.25)',
        boxShadow: '4px 0 40px rgba(82,80,243,0.18), 2px 0 12px rgba(13,148,136,0.08)',
      }}
    >
      {/* Orbi logo mark */}
      <motion.div
        className="flex items-center justify-center rounded-corner-md mb-md flex-shrink-0"
        style={{
          width: 40,
          height: 40,
          background: 'linear-gradient(135deg, #5250f3 0%, #0d9488 100%)',
          boxShadow: '0 0 20px rgba(82,80,243,0.5), 0 0 8px rgba(13,148,136,0.4)',
        }}
        animate={{
          boxShadow: [
            '0 0 16px rgba(82,80,243,0.5), 0 0 6px rgba(13,148,136,0.3)',
            '0 0 28px rgba(82,80,243,0.7), 0 0 12px rgba(13,148,136,0.5)',
            '0 0 16px rgba(82,80,243,0.5), 0 0 6px rgba(13,148,136,0.3)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Orbit size={18} className="text-white" strokeWidth={1.8} />
      </motion.div>

      {/* Top divider */}
      <div
        className="w-8 mb-sm flex-shrink-0"
        style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(82,80,243,0.5), transparent)' }}
      />

      {/* Main nav */}
      <div className="flex flex-col items-center gap-xs flex-1">
        {NAV_ITEMS.map((item) => (
          <NavButton key={item.path} {...item} active={isActive(item.path)} />
        ))}
      </div>

      {/* Bottom divider */}
      <div
        className="w-8 mt-sm mb-sm flex-shrink-0"
        style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(82,80,243,0.5), transparent)' }}
      />

      {/* Footer nav */}
      <div className="flex flex-col items-center gap-xs">
        {FOOTER_ITEMS.map((item) => (
          <NavButton key={item.path} {...item} active={isActive(item.path)} />
        ))}
      </div>

      {/* Avatar */}
      <Tooltip content="Alex Chen · Orbi Full" position="right">
        <motion.button
          className="flex items-center justify-center rounded-full cursor-pointer border-0 mt-sm flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #5250f3 0%, #7c3aed 100%)',
            boxShadow: '0 0 12px rgba(82,80,243,0.4)',
          }}
          whileHover={{ scale: 1.08, boxShadow: '0 0 20px rgba(82,80,243,0.6)' }}
          whileTap={{ scale: 0.94 }}
        >
          <span className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>AC</span>
        </motion.button>
      </Tooltip>
    </div>
  );
}
