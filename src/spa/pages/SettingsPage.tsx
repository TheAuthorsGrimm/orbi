import { useState, useRef, useEffect, useCallback } from 'react';
import {
  SecondaryNav, SecondaryNavItem, InputField, SwitchField,
  Button, ButtonGroup, Avatar, Badge,
} from '@figma/astraui';
import { useOrbiTheme, type OrbiTheme, type CustomTheme } from '@/spa/context/ThemeContext';
import {
  User, CreditCard, Bell, Sliders, Sparkles, Brain, Plus, X, Check,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  useOrbiProfile,
  DEFAULT_TASK_CATEGORIES,
  type TaskCategory,
  type OrbiProfile,
} from '../OrbiProfileContext';
import { useAuth } from '@/spa/context/AuthContext';
import { NativeSelectField as SelectField } from '../components/forms/NativeSelectField';

type SettingsSection = 'profile' | 'context' | 'preferences' | 'notifications' | 'billing' | 'persona';

// ─── Shared editing primitives ────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  gradient = 'var(--orbi-surface)',
  border = '1px solid var(--orbi-border)',
}: {
  title: string;
  children: React.ReactNode;
  gradient?: string;
  border?: string;
}) {
  return (
    <div
      className="rounded-corner-lg p-xl flex flex-col gap-lg"
      style={{ background: gradient, border }}
    >
      <h2 className="text-label text-text-primary">{title}</h2>
      {children}
    </div>
  );
}

function EditableTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-sm">
      {label && <label className="text-label-sm text-text-secondary">{label}</label>}
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-corner-md p-lg text-text-primary placeholder-text-tertiary resize-none outline-none"
        style={{
          background: 'color-mix(in srgb, var(--orbi-text) 4%, transparent)',
          border: '1.5px solid color-mix(in srgb, var(--orbi-text) 10%, transparent)',
          fontFamily: 'Atkinson Hyperlegible, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.6,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--orbi-primary) 50%, transparent)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--orbi-text) 10%, transparent)'; }}
      />
    </div>
  );
}

function ChipMultiSelect({
  label,
  options,
  selected,
  onChange,
  accent = 'var(--orbi-primary)',
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  accent?: string;
}) {
  const toggle = (opt: string) =>
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);

  return (
    <div className="flex flex-col gap-md">
      {label && <label className="text-label-sm text-text-secondary">{label}</label>}
      <div className="flex flex-wrap gap-sm">
        {options.map(opt => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggle(opt)}
              className="px-lg py-sm rounded-corner-full text-label-sm transition-all"
              style={{
                background: active ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'color-mix(in srgb, var(--orbi-text) 4%, transparent)',
                border: `1.5px solid ${active ? accent : 'color-mix(in srgb, var(--orbi-text) 10%, transparent)'}`,
                color: active ? accent : 'var(--orbi-text-muted)',
                cursor: 'pointer',
              }}
            >
              {active && <Check size={10} style={{ display: 'inline', marginRight: 4 }} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChipSingleSelect({
  label,
  options,
  value,
  onChange,
  accent = 'var(--orbi-primary)',
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-md">
      {label && <label className="text-label-sm text-text-secondary">{label}</label>}
      <div className="flex flex-wrap gap-sm">
        {options.map(opt => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className="px-lg py-sm rounded-corner-full text-label-sm transition-all"
              style={{
                background: active ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'color-mix(in srgb, var(--orbi-text) 4%, transparent)',
                border: `1.5px solid ${active ? accent : 'color-mix(in srgb, var(--orbi-text) 10%, transparent)'}`,
                color: active ? accent : 'var(--orbi-text-muted)',
                cursor: 'pointer',
              }}
            >
              {active && <Check size={10} style={{ display: 'inline', marginRight: 4 }} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Theme picker ─────────────────────────────────────────────────────────────

const THEME_PRESETS: Array<{
  id: OrbiTheme;
  name: string;
  description: string;
  base: string;
  primary: string;
  secondary: string;
  text: string;
}> = [
  { id: 'focus',         name: 'Focus',         description: 'Deep navy · Indigo + Teal',       base: '#0b0a18', primary: '#5250f3', secondary: '#0d9488', text: '#f0efff' },
  { id: 'warm',          name: 'Warm',           description: 'Cozy plum · Violet + Rose',       base: '#1a1224', primary: '#8b5cf6', secondary: '#ec4899', text: '#faf0ff' },
  { id: 'fresh',         name: 'Fresh',          description: 'Off-white · Sage + Coral',        base: '#faf8f4', primary: '#059669', secondary: '#f97162', text: '#1a1a1a' },
  { id: 'calm',          name: 'Calm',           description: 'Parchment · Slate-blue + Sage',   base: '#f5f2ec', primary: '#4a6fa5', secondary: '#5a8a72', text: '#2a2520' },
  { id: 'high-contrast', name: 'High Contrast',  description: 'True black · Blue + Teal',        base: '#000000', primary: '#3b82f6', secondary: '#14b8a6', text: '#ffffff' },
];

// Named palette combos for the Palette tab
const PALETTE_PRESETS: Array<{
  name: string; emoji: string;
  primary: string; secondary: string; mode: 'dark' | 'light';
}> = [
  { name: 'Ocean',    emoji: '🌊', primary: '#0ea5e9', secondary: '#06b6d4', mode: 'dark'  },
  { name: 'Sunset',   emoji: '🌅', primary: '#f97316', secondary: '#ef4444', mode: 'dark'  },
  { name: 'Forest',   emoji: '🌲', primary: '#22c55e', secondary: '#14b8a6', mode: 'dark'  },
  { name: 'Candy',    emoji: '🍭', primary: '#ec4899', secondary: '#a855f7', mode: 'dark'  },
  { name: 'Midnight', emoji: '🌙', primary: '#6366f1', secondary: '#8b5cf6', mode: 'dark'  },
  { name: 'Ember',    emoji: '🔥', primary: '#f59e0b', secondary: '#ef4444', mode: 'dark'  },
  { name: 'Rose',     emoji: '🌹', primary: '#f43f5e', secondary: '#fb923c', mode: 'dark'  },
  { name: 'Arctic',   emoji: '❄️',  primary: '#38bdf8', secondary: '#a5f3fc', mode: 'dark'  },
  { name: 'Sage',     emoji: '🌿', primary: '#4ade80', secondary: '#2dd4bf', mode: 'light' },
  { name: 'Citrus',   emoji: '🍋', primary: '#ca8a04', secondary: '#ea580c', mode: 'light' },
  { name: 'Dusk',     emoji: '🌆', primary: '#7c3aed', secondary: '#db2777', mode: 'dark'  },
  { name: 'Steel',    emoji: '⚙️',  primary: '#64748b', secondary: '#3b82f6', mode: 'dark'  },
];

// Grid colors: 12 hues × 5 lightness levels + grays
function buildGrid(): string[] {
  const hues = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  const lValues = [25, 40, 55, 68, 80];
  const colors: string[] = [];
  for (const l of lValues) {
    for (const h of hues) {
      colors.push(`hsl(${h},85%,${l}%)`);
    }
  }
  // Grays row
  [8, 20, 35, 50, 65, 76, 88, 94, 97, 100, 0, 14].forEach(l =>
    colors.push(`hsl(240,5%,${l}%)`)
  );
  return colors;
}
const GRID_COLORS = buildGrid();

// ── Color utilities ───────────────────────────────────────────────────────────

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  let r = 0, g = 0, b = 0;
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    r = parseInt(clean[0]+clean[0], 16);
    g = parseInt(clean[1]+clean[1], 16);
    b = parseInt(clean[2]+clean[2], 16);
  } else if (clean.length >= 6) {
    r = parseInt(clean.slice(0,2), 16);
    g = parseInt(clean.slice(2,4), 16);
    b = parseInt(clean.slice(4,6), 16);
  }
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function resolveToHex(color: string): string {
  // If it's already a hex, return it. If hsl(), convert it.
  if (color.startsWith('#')) return color;
  if (color.startsWith('hsl(')) {
    const m = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (m) return hslToHex(+m[1], +m[2], +m[3]);
  }
  return '#5250f3';
}

function generateTheme(primary: string, secondary: string, mode: 'dark' | 'light'): CustomTheme {
  const ph = hexToHsl(primary);
  if (mode === 'dark') {
    return {
      primary,
      secondary,
      base:       hslToHex(ph.h, Math.max(ph.s * 0.25, 10), 6),
      surface:    hslToHex(ph.h, Math.max(ph.s * 0.22, 8),  9),
      surface2:   hslToHex(ph.h, Math.max(ph.s * 0.18, 6),  13),
      text:       '#f0efff',
      textMuted:  'rgba(240,239,255,0.55)',
      border:     `color-mix(in srgb, ${primary} 25%, transparent)`,
      mode:       'dark',
    };
  } else {
    return {
      primary,
      secondary,
      base:       hslToHex(ph.h, Math.max(ph.s * 0.18, 8),  97),
      surface:    '#ffffff',
      surface2:   hslToHex(ph.h, Math.max(ph.s * 0.14, 6),  94),
      text:       '#1a1a1a',
      textMuted:  'rgba(26,26,26,0.55)',
      border:     `color-mix(in srgb, ${primary} 20%, transparent)`,
      mode:       'light',
    };
  }
}

// ── Sub-pickers ───────────────────────────────────────────────────────────────

function ColorWheel({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const [hsl, setHsl] = useState<{ h: number; s: number; l: number }>(() => hexToHsl(value));
  const [dragging, setDragging] = useState(false);
  const [hexInput, setHexInput] = useState(value);

  useEffect(() => {
    setHsl(hexToHsl(value));
    setHexInput(value);
  }, [value]);

  const WHEEL_SIZE = 220;
  const r = WHEEL_SIZE / 2;

  const pickFromEvent = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const dx = clientX - (rect.left + r);
    const dy = clientY - (rect.top + r);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const sat = Math.min((dist / r) * 100, 100);
    const angle = ((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360;
    const newHsl = { h: Math.round(angle), s: Math.round(sat), l: hsl.l };
    setHsl(newHsl);
    const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
    setHexInput(hex);
    onChange(hex);
  }, [r, hsl.l, onChange]);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => pickFromEvent(e.clientX, e.clientY);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, pickFromEvent]);

  const dotX = r + Math.cos((hsl.h * Math.PI) / 180) * (hsl.s / 100) * (r - 6);
  const dotY = r + Math.sin((hsl.h * Math.PI) / 180) * (hsl.s / 100) * (r - 6);
  const preview = hslToHex(hsl.h, hsl.s, hsl.l);

  return (
    <div className="flex flex-col gap-lg items-center">
      {/* Wheel */}
      <div
        ref={wheelRef}
        onMouseDown={e => { setDragging(true); pickFromEvent(e.clientX, e.clientY); }}
        style={{
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          borderRadius: '50%',
          background: `
            radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 65%),
            conic-gradient(
              hsl(0,100%,50%), hsl(45,100%,50%), hsl(90,100%,50%),
              hsl(135,100%,50%), hsl(180,100%,50%), hsl(225,100%,50%),
              hsl(270,100%,50%), hsl(315,100%,50%), hsl(360,100%,50%)
            )
          `,
          position: 'relative',
          cursor: 'crosshair',
          userSelect: 'none',
          flexShrink: 0,
          border: '2px solid color-mix(in srgb, var(--orbi-text) 10%, transparent)',
        }}
      >
        {/* Lightness darkening overlay */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: `rgba(0,0,0,${Math.max(0, (50 - hsl.l) / 80)})`,
          pointerEvents: 'none',
        }} />
        {/* Selection dot */}
        <div style={{
          position: 'absolute',
          left: dotX - 8,
          top: dotY - 8,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: preview,
          border: '2.5px solid white',
          boxShadow: '0 1px 6px rgba(0,0,0,0.5)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Lightness slider */}
      <div className="w-full flex flex-col gap-xs" style={{ maxWidth: WHEEL_SIZE }}>
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-text-secondary">Lightness</span>
          <span className="text-label-sm text-text-tertiary">{hsl.l}%</span>
        </div>
        <div style={{
          height: 14, borderRadius: 7, position: 'relative',
          background: `linear-gradient(to right, #000 0%, hsl(${hsl.h},${hsl.s}%,50%) 50%, #fff 100%)`,
          border: '1px solid color-mix(in srgb, var(--orbi-text) 12%, transparent)',
        }}>
          <input type="range" min={10} max={90} value={hsl.l}
            onChange={e => {
              const newHsl = { ...hsl, l: +e.target.value };
              setHsl(newHsl);
              const hex = hslToHex(newHsl.h, newHsl.s, newHsl.l);
              setHexInput(hex);
              onChange(hex);
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* Preview + hex input */}
      <div className="flex gap-md items-center" style={{ maxWidth: WHEEL_SIZE, width: '100%' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 8, flexShrink: 0,
          background: preview,
          border: '2px solid color-mix(in srgb, var(--orbi-text) 15%, transparent)',
          boxShadow: `0 0 12px ${preview}88`,
        }} />
        <input
          type="text"
          value={hexInput}
          onChange={e => {
            setHexInput(e.target.value);
            if (/^#[0-9a-f]{6}$/i.test(e.target.value)) {
              const newHsl = hexToHsl(e.target.value);
              setHsl(newHsl);
              onChange(e.target.value);
            }
          }}
          className="flex-1 bg-transparent text-text-primary outline-none rounded-corner-sm px-md py-xs"
          style={{
            fontSize: '0.85rem',
            border: '1px solid color-mix(in srgb, var(--orbi-text) 15%, transparent)',
            fontFamily: 'monospace',
          }}
          placeholder="#000000"
          spellCheck={false}
        />
        {/* Native color fallback */}
        <input
          type="color"
          value={preview}
          onChange={e => {
            const newHsl = hexToHsl(e.target.value);
            setHsl(newHsl);
            setHexInput(e.target.value);
            onChange(e.target.value);
          }}
          style={{ width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 2 }}
          title="Open system color picker"
        />
      </div>
    </div>
  );
}

function ColorGrid({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <div className="flex flex-col gap-md">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
        {GRID_COLORS.map((color, i) => {
          const hex = resolveToHex(color);
          const active = value.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={i}
              onClick={() => onChange(hex)}
              title={hex}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 4,
                background: color,
                border: active ? '2px solid var(--orbi-text)' : '1.5px solid transparent',
                outline: active ? '2px solid var(--orbi-primary)' : 'none',
                outlineOffset: 1,
                cursor: 'pointer',
                transition: 'transform 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          );
        })}
      </div>
      <div className="flex gap-md items-center">
        <div style={{
          width: 32, height: 32, borderRadius: 6, flexShrink: 0,
          background: value,
          border: '2px solid color-mix(in srgb, var(--orbi-text) 15%, transparent)',
        }} />
        <span className="text-label-sm text-text-secondary" style={{ fontFamily: 'monospace' }}>{value}</span>
      </div>
    </div>
  );
}

function PaletteGrid({ onPick }: { onPick: (primary: string, secondary: string, mode: 'dark' | 'light') => void }) {
  return (
    <div className="grid grid-cols-2 gap-md">
      {PALETTE_PRESETS.map(p => (
        <motion.button
          key={p.name}
          onClick={() => onPick(p.primary, p.secondary, p.mode)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-md rounded-corner-md p-md text-left"
          style={{
            background: p.mode === 'dark'
              ? `linear-gradient(135deg, ${p.primary}22, ${p.secondary}18)`
              : `linear-gradient(135deg, ${p.primary}18, ${p.secondary}14)`,
            border: `1.5px solid color-mix(in srgb, ${p.primary} 30%, transparent)`,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>{p.emoji}</span>
          <div className="flex flex-col gap-xs flex-1 min-w-0">
            <span className="text-label-sm text-text-primary" style={{ fontWeight: 600 }}>{p.name}</span>
            <div className="flex gap-xs">
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.primary, flexShrink: 0 }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.secondary, flexShrink: 0 }} />
              <span style={{ fontSize: '0.65rem', color: 'color-mix(in srgb, var(--orbi-text) 50%, transparent)' }}>
                {p.mode}
              </span>
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ── Main ThemePicker ──────────────────────────────────────────────────────────

type PickerTab = 'presets' | 'wheel' | 'grid' | 'palette';

function ThemePicker({
  current,
  onPick,
  customTheme,
  onCustom,
}: {
  current: OrbiTheme;
  onPick: (t: OrbiTheme) => void;
  customTheme: CustomTheme | null;
  onCustom: (ct: CustomTheme) => void;
}) {
  const [tab, setTab] = useState<PickerTab>('presets');
  const [primaryColor, setPrimaryColor] = useState(customTheme?.primary ?? '#5250f3');
  const [secondaryColor, setSecondaryColor] = useState(customTheme?.secondary ?? '#0d9488');
  const [colorMode, setColorMode] = useState<'dark' | 'light'>(customTheme?.mode ?? 'dark');
  const [activeWheel, setActiveWheel] = useState<'primary' | 'secondary'>('primary');

  function applyCustom(primary: string, secondary: string, mode: 'dark' | 'light') {
    const theme = generateTheme(primary, secondary, mode);
    onCustom(theme);
  }

  const TABS: { id: PickerTab; label: string }[] = [
    { id: 'presets', label: 'Presets' },
    { id: 'wheel',   label: 'Wheel'   },
    { id: 'grid',    label: 'Grid'    },
    { id: 'palette', label: 'Palette' },
  ];

  return (
    <div className="flex flex-col gap-md">
      {/* Tab row */}
      <div className="flex gap-xs p-xs rounded-corner-md" style={{ background: 'color-mix(in srgb, var(--orbi-text) 6%, transparent)' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 rounded-corner-sm py-xs text-label-sm transition-all"
            style={{
              background: tab === t.id ? 'var(--orbi-primary)' : 'transparent',
              color: tab === t.id ? '#fff' : 'color-mix(in srgb, var(--orbi-text) 65%, transparent)',
              fontWeight: tab === t.id ? 600 : 400,
              fontSize: '0.78rem',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Presets tab ── */}
      {tab === 'presets' && (
        <div className="flex flex-col gap-md">
          <div className="grid grid-cols-2 gap-md">
            {THEME_PRESETS.map(preset => {
              const active = current === preset.id;
              return (
                <motion.button
                  key={preset.id}
                  onClick={() => onPick(preset.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex flex-col gap-sm rounded-corner-md p-md text-left"
                  style={{
                    background: preset.base,
                    border: active ? `2px solid ${preset.primary}` : '2px solid color-mix(in srgb, var(--orbi-text) 8%, transparent)',
                    boxShadow: active ? `0 0 16px ${preset.primary}55` : 'none',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <div className="flex gap-xs" style={{ height: 8 }}>
                    <div style={{ flex: 1, borderRadius: 4, background: preset.base, border: '1px solid rgba(0,0,0,0.15)' }} />
                    <div style={{ flex: 1, borderRadius: 4, background: preset.primary }} />
                    <div style={{ flex: 1, borderRadius: 4, background: preset.secondary }} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <span className="text-label-sm" style={{ color: preset.text, fontWeight: 600, fontSize: '0.8rem' }}>{preset.name}</span>
                    <span style={{ color: preset.text, opacity: 0.55, fontSize: '0.7rem' }}>{preset.description}</span>
                  </div>
                  {active && (
                    <div className="absolute top-sm right-sm flex items-center justify-center rounded-full" style={{ width: 18, height: 18, background: preset.primary }}>
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Wheel tab ── */}
      {tab === 'wheel' && (
        <div className="flex flex-col gap-lg">
          {/* Primary / Secondary selector */}
          <div className="flex gap-sm">
            {(['primary', 'secondary'] as const).map(slot => (
              <button
                key={slot}
                onClick={() => setActiveWheel(slot)}
                className="flex-1 flex items-center gap-md rounded-corner-md p-md transition-all"
                style={{
                  border: activeWheel === slot
                    ? `2px solid ${slot === 'primary' ? primaryColor : secondaryColor}`
                    : '2px solid color-mix(in srgb, var(--orbi-text) 10%, transparent)',
                  background: activeWheel === slot ? 'color-mix(in srgb, var(--orbi-primary) 8%, transparent)' : 'transparent',
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: slot === 'primary' ? primaryColor : secondaryColor, border: '2px solid color-mix(in srgb, var(--orbi-text) 15%, transparent)' }} />
                <span className="text-label-sm text-text-secondary capitalize">{slot}</span>
              </button>
            ))}
          </div>

          {/* Wheel */}
          <div className="flex justify-center">
            {activeWheel === 'primary' ? (
              <ColorWheel
                value={primaryColor}
                onChange={hex => {
                  setPrimaryColor(hex);
                  applyCustom(hex, secondaryColor, colorMode);
                }}
              />
            ) : (
              <ColorWheel
                value={secondaryColor}
                onChange={hex => {
                  setSecondaryColor(hex);
                  applyCustom(primaryColor, hex, colorMode);
                }}
              />
            )}
          </div>

          {/* Dark / Light mode toggle */}
          <div className="flex items-center justify-between pt-sm" style={{ borderTop: '1px solid color-mix(in srgb, var(--orbi-text) 8%, transparent)' }}>
            <span className="text-label-sm text-text-secondary">Background mode</span>
            <div className="flex gap-xs p-xs rounded-corner-md" style={{ background: 'color-mix(in srgb, var(--orbi-text) 6%, transparent)' }}>
              {(['dark', 'light'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setColorMode(m); applyCustom(primaryColor, secondaryColor, m); }}
                  className="px-lg py-xs rounded-corner-sm text-label-sm transition-all capitalize"
                  style={{
                    background: colorMode === m ? 'var(--orbi-primary)' : 'transparent',
                    color: colorMode === m ? '#fff' : 'color-mix(in srgb, var(--orbi-text) 65%, transparent)',
                    fontWeight: colorMode === m ? 600 : 400,
                    fontSize: '0.78rem',
                  }}
                >
                  {m === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>

          {/* Apply button */}
          <button
            onClick={() => applyCustom(primaryColor, secondaryColor, colorMode)}
            className="w-full rounded-corner-md py-md text-label-sm font-semibold transition-all"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#fff' }}
          >
            Apply Custom Theme
          </button>
        </div>
      )}

      {/* ── Grid tab ── */}
      {tab === 'grid' && (
        <div className="flex flex-col gap-lg">
          <div className="flex gap-sm">
            {(['primary', 'secondary'] as const).map(slot => (
              <button
                key={slot}
                onClick={() => setActiveWheel(slot)}
                className="flex-1 flex items-center gap-md rounded-corner-md p-md transition-all"
                style={{
                  border: activeWheel === slot
                    ? `2px solid ${slot === 'primary' ? primaryColor : secondaryColor}`
                    : '2px solid color-mix(in srgb, var(--orbi-text) 10%, transparent)',
                  background: activeWheel === slot ? 'color-mix(in srgb, var(--orbi-primary) 8%, transparent)' : 'transparent',
                }}
              >
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: slot === 'primary' ? primaryColor : secondaryColor, border: '2px solid color-mix(in srgb, var(--orbi-text) 15%, transparent)' }} />
                <span className="text-label-sm text-text-secondary capitalize">{slot}</span>
              </button>
            ))}
          </div>

          <ColorGrid
            value={activeWheel === 'primary' ? primaryColor : secondaryColor}
            onChange={hex => {
              if (activeWheel === 'primary') {
                setPrimaryColor(hex);
                applyCustom(hex, secondaryColor, colorMode);
              } else {
                setSecondaryColor(hex);
                applyCustom(primaryColor, hex, colorMode);
              }
            }}
          />

          <div className="flex items-center justify-between">
            <span className="text-label-sm text-text-secondary">Background mode</span>
            <div className="flex gap-xs p-xs rounded-corner-md" style={{ background: 'color-mix(in srgb, var(--orbi-text) 6%, transparent)' }}>
              {(['dark', 'light'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => { setColorMode(m); applyCustom(primaryColor, secondaryColor, m); }}
                  className="px-lg py-xs rounded-corner-sm text-label-sm transition-all capitalize"
                  style={{
                    background: colorMode === m ? 'var(--orbi-primary)' : 'transparent',
                    color: colorMode === m ? '#fff' : 'color-mix(in srgb, var(--orbi-text) 65%, transparent)',
                    fontWeight: colorMode === m ? 600 : 400,
                    fontSize: '0.78rem',
                  }}
                >
                  {m === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => applyCustom(primaryColor, secondaryColor, colorMode)}
            className="w-full rounded-corner-md py-md text-label-sm font-semibold transition-all"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, color: '#fff' }}
          >
            Apply Custom Theme
          </button>
        </div>
      )}

      {/* ── Palette tab ── */}
      {tab === 'palette' && (
        <div className="flex flex-col gap-md">
          <p className="text-label-sm text-text-secondary">Pick a curated pair — applies instantly.</p>
          <PaletteGrid
            onPick={(p, s, m) => {
              setPrimaryColor(p);
              setSecondaryColor(s);
              setColorMode(m);
              applyCustom(p, s, m);
            }}
          />
        </div>
      )}

      {/* Active custom indicator */}
      {current === 'custom' && (
        <div className="flex items-center gap-md rounded-corner-sm px-md py-sm" style={{ background: 'color-mix(in srgb, var(--orbi-primary) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--orbi-primary)', flexShrink: 0 }} />
          <span className="text-label-sm" style={{ color: 'var(--orbi-primary)', fontSize: '0.75rem' }}>Custom theme active</span>
          <button
            onClick={() => onPick('focus')}
            className="ml-auto text-label-sm text-text-tertiary hover:text-text-secondary transition-colors"
            style={{ fontSize: '0.72rem' }}
          >
            Reset to Focus
          </button>
        </div>
      )}

      <p className="text-label-sm text-text-tertiary" style={{ fontSize: '0.72rem' }}>
        Amber ✦ is the shared reward accent — streak & task-complete animations stay consistent across themes.
      </p>
    </div>
  );
}

// ─── My Context section ───────────────────────────────────────────────────────

const CATEGORY_COLORS = ['#5250f3', '#0891b2', '#059669', '#d97706', '#7c3aed', '#db2777', '#ea580c', '#0d9488'];
const CATEGORY_EMOJIS = ['💡', '🔬', '🎵', '🏋️', '🍕', '✍️', '🌍', '🔧', '🐾', '📸', '🧘', '🎮'];

function CategoryManager({ profile, update }: { profile: OrbiProfile; update: (p: Partial<OrbiProfile>) => void }) {
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newEmoji, setNewEmoji] = useState('💡');
  const [newColor, setNewColor] = useState('#5250f3');
  const selected = profile.taskCategories.map(c => c.id);

  const toggleDefault = (cat: TaskCategory) => {
    const isOn = selected.includes(cat.id);
    if (isOn) update({ taskCategories: profile.taskCategories.filter(c => c.id !== cat.id) });
    else update({ taskCategories: [...profile.taskCategories, cat] });
  };

  const addCustom = () => {
    if (!newLabel.trim()) return;
    const cat: TaskCategory = { id: `custom-${Date.now()}`, label: newLabel.trim(), emoji: newEmoji, color: newColor, custom: true };
    update({ taskCategories: [...profile.taskCategories, cat] });
    setNewLabel('');
    setAdding(false);
  };

  const removeCustom = (id: string) =>
    update({ taskCategories: profile.taskCategories.filter(c => c.id !== id) });

  return (
    <div className="flex flex-col gap-lg">
      <p className="text-label-sm text-text-secondary">
        Task categories help Orbi understand the different areas of your life. Toggle to enable.
      </p>

      {/* Default categories grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-md">
        {DEFAULT_TASK_CATEGORIES.map(cat => {
          const on = selected.includes(cat.id);
          return (
            <motion.button
              key={cat.id}
              onClick={() => toggleDefault(cat)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-sm py-lg px-md rounded-corner-md text-center"
              style={{
                background: on ? cat.color + '20' : 'color-mix(in srgb, var(--orbi-text) 4%, transparent)',
                border: `2px solid ${on ? cat.color : 'color-mix(in srgb, var(--orbi-text) 8%, transparent)'}`,
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: '1.4rem' }}>{cat.emoji}</span>
              <span className="text-label-sm text-text-primary" style={{ fontSize: '0.76rem', lineHeight: 1.3 }}>{cat.label}</span>
              {on && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: cat.color }}>
                  <Check size={10} className="text-white" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Custom categories */}
      {profile.taskCategories.filter(c => c.custom).length > 0 && (
        <div className="flex flex-col gap-sm">
          <p className="text-label-sm text-text-tertiary">Custom categories</p>
          <div className="flex flex-wrap gap-sm">
            {profile.taskCategories.filter(c => c.custom).map(cat => (
              <div
                key={cat.id}
                className="flex items-center gap-sm px-lg py-sm rounded-corner-full"
                style={{ background: cat.color + '20', border: `1.5px solid ${cat.color}60` }}
              >
                <span>{cat.emoji}</span>
                <span className="text-label-sm text-text-primary">{cat.label}</span>
                <button onClick={() => removeCustom(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={12} style={{ color: 'var(--orbi-text-muted)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add custom */}
      {adding ? (
        <div
          className="rounded-corner-md p-lg flex flex-col gap-md"
          style={{ background: 'color-mix(in srgb, var(--orbi-text) 4%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)' }}
        >
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
            placeholder="Category name..."
            className="w-full bg-transparent outline-none text-text-primary placeholder-text-tertiary"
            style={{ fontFamily: 'Atkinson Hyperlegible, sans-serif', fontSize: '1rem' }}
          />
          <div className="flex flex-wrap gap-sm">
            {CATEGORY_EMOJIS.map(em => (
              <button key={em} onClick={() => setNewEmoji(em)}
                className="w-8 h-8 rounded-corner-sm flex items-center justify-center"
                style={{ background: newEmoji === em ? 'color-mix(in srgb, var(--orbi-primary) 20%, transparent)' : 'transparent', border: `1px solid ${newEmoji === em ? 'var(--orbi-primary)' : 'transparent'}`, cursor: 'pointer' }}>
                {em}
              </button>
            ))}
          </div>
          <div className="flex gap-sm items-center">
            {CATEGORY_COLORS.map(c => (
              <button key={c} onClick={() => setNewColor(c)}
                className="w-5 h-5 rounded-full"
                style={{ background: c, outline: newColor === c ? `3px solid ${c}66` : 'none', outlineOffset: 2, border: 'none', cursor: 'pointer' }} />
            ))}
          </div>
          <div className="flex gap-sm">
            <button onClick={addCustom} className="px-lg py-sm rounded-corner-md text-white text-label-sm" style={{ background: 'var(--orbi-primary)', border: 'none', cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} className="px-lg py-sm rounded-corner-md text-label-sm text-text-tertiary" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-md px-lg py-md rounded-corner-md text-label-sm"
          style={{ background: 'color-mix(in srgb, var(--orbi-text) 4%, transparent)', border: '2px dashed color-mix(in srgb, var(--orbi-text) 10%, transparent)', color: 'color-mix(in srgb, var(--orbi-text) 35%, transparent)', cursor: 'pointer' }}
        >
          <Plus size={14} /> Add custom category
        </button>
      )}
    </div>
  );
}

function MyContextSection() {
  const { profile, updateProfile } = useOrbiProfile();
  const [saved, setSaved] = useState(false);

  const save = () => {
    updateProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 64rem)" }}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="text-title text-text-primary">My Context</h1>
          <p className="text-label-sm text-text-secondary mt-xs">
            The personal context that makes Orbi your AI companion — not just any chatbot
          </p>
        </div>
        <motion.div
          animate={saved ? { scale: [1, 1.1, 1] } : {}}
        >
          <Button
            variant={saved ? 'neutral' : 'primary'}
            onClick={save}
            iconStart={saved ? <Check size={16} /> : undefined}
          >
            {saved ? 'Saved!' : 'Save context'}
          </Button>
        </motion.div>
      </div>

      {/* About You */}
      <SectionCard title="About you">
        <InputField
          label="Preferred name (how Orbi addresses you)"
          value={profile.preferredName}
          onChange={v => updateProfile({ preferredName: v })}
          placeholder="Your name"
        />
        <ChipSingleSelect
          label="Pronouns"
          options={['he/him', 'she/her', 'they/them', 'he/they', 'she/they', 'any/all', 'prefer not to say']}
          value={profile.pronouns}
          onChange={v => updateProfile({ pronouns: v })}
          accent="var(--orbi-primary)"
        />
        <ChipMultiSelect
          label="Life roles (select all that apply)"
          options={['Student', 'Employee', 'Freelancer', 'Entrepreneur', 'Parent', 'Caregiver', 'Creative', 'Job seeker', 'Remote worker', 'Shift worker']}
          selected={profile.lifeRole}
          onChange={v => updateProfile({ lifeRole: v })}
          accent="#5eead4"
        />
        <EditableTextarea
          label="What's most important to you right now?"
          value={profile.currentFocus}
          onChange={v => updateProfile({ currentFocus: v })}
          placeholder="e.g. Getting healthy, landing a new job, finishing my degree..."
          rows={2}
        />
      </SectionCard>

      {/* Career & Work */}
      <SectionCard
        title="Career & work"
        gradient="var(--orbi-surface)"
        border="1px solid color-mix(in srgb, var(--orbi-primary) 20%, transparent)"
      >
        <div className="grid grid-cols-2 gap-lg">
          <InputField
            label="Job title or role"
            value={profile.jobTitle}
            onChange={v => updateProfile({ jobTitle: v })}
            placeholder="Software developer, Teacher..."
          />
          <InputField
            label="Industry"
            value={profile.industry}
            onChange={v => updateProfile({ industry: v })}
            placeholder="Tech, Healthcare, Education..."
          />
        </div>
        <ChipSingleSelect
          label="Employment type"
          options={['Full-time employed', 'Part-time', 'Freelance / contract', 'Self-employed', 'Student', 'Between jobs', 'Not working currently']}
          value={profile.employmentType}
          onChange={v => updateProfile({ employmentType: v })}
          accent="var(--orbi-primary)"
        />
        <ChipSingleSelect
          label="Where do you work?"
          options={['Fully remote', 'Hybrid', 'In office / on-site', 'On the go / field work', 'Varies']}
          value={profile.workStyle}
          onChange={v => updateProfile({ workStyle: v })}
          accent="var(--orbi-primary)"
        />
        <EditableTextarea
          label="What are you working toward career-wise?"
          value={profile.careerNote}
          onChange={v => updateProfile({ careerNote: v })}
          placeholder="e.g. Getting promoted, switching careers, building my business..."
          rows={2}
        />
      </SectionCard>

      {/* Goals */}
      <SectionCard
        title="Your goals"
        gradient="var(--orbi-surface)"
        border="1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)"
      >
        <div
          className="rounded-corner-md p-lg flex flex-col gap-md"
          style={{ background: 'color-mix(in srgb, var(--orbi-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 20%, transparent)' }}
        >
          <p className="text-label-sm text-text-secondary flex items-center gap-sm">
            <span>🔥</span> <strong className="text-text-primary">This week</strong> — #1 thing to accomplish
          </p>
          <EditableTextarea
            label=""
            value={profile.shortTermGoal}
            onChange={v => updateProfile({ shortTermGoal: v })}
            placeholder="e.g. Submit the project proposal, book the doctor appointment..."
            rows={2}
          />
        </div>

        <div
          className="rounded-corner-md p-lg flex flex-col gap-md"
          style={{ background: 'color-mix(in srgb, var(--orbi-secondary) 6%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-secondary) 20%, transparent)' }}
        >
          <p className="text-label-sm text-text-secondary flex items-center gap-sm">
            <span>🎯</span> <strong className="text-text-primary">This month</strong> — what you want in motion
          </p>
          <EditableTextarea
            label=""
            value={profile.mediumTermGoal}
            onChange={v => updateProfile({ mediumTermGoal: v })}
            placeholder="e.g. Build a consistent morning routine, finish the online course..."
            rows={2}
          />
        </div>

        <div
          className="rounded-corner-md p-lg flex flex-col gap-md"
          style={{ background: 'color-mix(in srgb, var(--orbi-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 20%, transparent)' }}
        >
          <p className="text-label-sm text-text-secondary flex items-center gap-sm">
            <span>🌟</span> <strong className="text-text-primary">Big dream</strong> — where you want to be in a year
          </p>
          <EditableTextarea
            label=""
            value={profile.longTermGoal}
            onChange={v => updateProfile({ longTermGoal: v })}
            placeholder="e.g. Launch my own business, feel financially secure, publish my book..."
            rows={2}
          />
        </div>
      </SectionCard>

      {/* Task Categories */}
      <SectionCard
        title="Task categories"
        gradient="var(--orbi-surface)"
        border="1px solid rgba(5,150,105,0.2)"
      >
        <CategoryManager profile={profile} update={updateProfile} />
      </SectionCard>

      {/* ADHD Profile */}
      <SectionCard
        title="Your brain profile"
        gradient="var(--orbi-surface)"
        border="1px solid color-mix(in srgb, var(--orbi-primary) 25%, transparent)"
      >
        <div
          className="rounded-corner-md px-lg py-md"
          style={{ background: 'color-mix(in srgb, var(--orbi-primary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 15%, transparent)' }}
        >
          <p className="text-label-sm" style={{ color: 'var(--orbi-primary)' }}>
            💜 This helps Orbi give you better-suited support — not judgment. Be as honest as you like.
          </p>
        </div>

        <ChipMultiSelect
          label="What challenges you most?"
          options={[
            'Starting tasks', 'Staying on task', 'Managing time', 'Remembering things',
            'Prioritizing', 'Following through', 'Managing emotions', 'Task transitions',
            'Organization', "Hyperfocus (can't stop)", 'Decision fatigue', 'Overwhelm',
          ]}
          selected={profile.adhdChallenges}
          onChange={v => updateProfile({ adhdChallenges: v })}
          accent="var(--orbi-primary)"
        />

        <ChipMultiSelect
          label="Your superpowers"
          options={[
            'Creative thinking', 'Hyperfocus on interests', 'High energy', 'Problem solving',
            'Empathy', 'Entrepreneurial drive', 'Outside-the-box ideas', 'Resilience',
            'Pattern recognition', 'Enthusiasm & passion', 'Crisis handling', 'Spontaneity',
          ]}
          selected={profile.adhdStrengths}
          onChange={v => updateProfile({ adhdStrengths: v })}
          accent="var(--orbi-secondary)"
        />

        <ChipSingleSelect
          label="When is your brain at its best?"
          options={['Morning (6–12pm)', 'Afternoon (12–5pm)', 'Evening (5–9pm)', 'Night owl (9pm–2am)', 'Varies wildly']}
          value={profile.peakHours}
          onChange={v => updateProfile({ peakHours: v })}
          accent="var(--orbi-primary)"
        />

        <ChipMultiSelect
          label="What helps you focus?"
          options={[
            'Lo-fi / chill music', 'White noise', 'Complete silence', 'Body doubling',
            'Movement / walking', 'Caffeine', 'Pomodoro timers', 'Background TV',
            'Noise-cancelling headphones', 'Short deadlines', 'Breaking into tiny steps',
          ]}
          selected={profile.focusHelpers}
          onChange={v => updateProfile({ focusHelpers: v })}
          accent="var(--orbi-secondary)"
        />

        <EditableTextarea
          label="Anything else Orbi should know about how you work?"
          value={profile.adhdNote}
          onChange={v => updateProfile({ adhdNote: v })}
          placeholder="e.g. I need reminders broken into tiny steps, I shut down with too many notifications..."
          rows={3}
        />
      </SectionCard>

      <ButtonGroup align="end">
        <Button variant="neutral" onClick={() => {}}>Discard changes</Button>
        <Button variant="primary" onClick={save} iconStart={saved ? <Check size={16} /> : undefined}>
          {saved ? 'Saved!' : 'Save all context'}
        </Button>
      </ButtonGroup>
    </div>
  );
}

// ─── Main Settings page ───────────────────────────────────────────────────────

export function SettingsPage() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [timezone, setTimezone] = useState((user as { preferences?: { timezone?: string } } | null)?.preferences?.timezone ?? 'america_toronto');
  const [focusDuration, setFocusDuration] = useState('25');
  const [breakDuration, setBreakDuration] = useState('5');
  const [notifications, setNotifications] = useState(true);
  const { theme: orbiTheme, setTheme: setOrbiTheme, customTheme, setCustomTheme } = useOrbiTheme();

  return (
    <div className="flex h-full">
      <SecondaryNav title="Settings">
        <SecondaryNavItem
          icon={<User className="size-full" strokeWidth={1.5} />}
          label="Profile"
          active={activeSection === 'profile'}
          onClick={() => setActiveSection('profile')}
        />
        <SecondaryNavItem
          icon={<Brain className="size-full" strokeWidth={1.5} />}
          label="My Context"
          active={activeSection === 'context'}
          onClick={() => setActiveSection('context')}
        />
        <SecondaryNavItem
          icon={<Sliders className="size-full" strokeWidth={1.5} />}
          label="Preferences"
          active={activeSection === 'preferences'}
          onClick={() => setActiveSection('preferences')}
        />
        <SecondaryNavItem
          icon={<Bell className="size-full" strokeWidth={1.5} />}
          label="Notifications"
          active={activeSection === 'notifications'}
          onClick={() => setActiveSection('notifications')}
        />
        <SecondaryNavItem
          icon={<Sparkles className="size-full" strokeWidth={1.5} />}
          label="Orbi Persona"
          active={activeSection === 'persona'}
          onClick={() => setActiveSection('persona')}
        />
        <SecondaryNavItem
          icon={<CreditCard className="size-full" strokeWidth={1.5} />}
          label="Billing"
          active={activeSection === 'billing'}
          onClick={() => setActiveSection('billing')}
        />
      </SecondaryNav>

      <main
        className="flex-1 p-md md:p-2xl overflow-y-auto"
        style={{ background: 'var(--orbi-gradient)' }}
      >
        {/* ── My Context ── */}
        {activeSection === 'context' && <MyContextSection />}

        {/* ── Profile ── */}
        {activeSection === 'profile' && (
          <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 48rem)" }}>
            <div className="flex flex-col gap-xs">
              <h1 className="text-title text-text-primary">Profile</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Manage your account information</p>
            </div>

            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Profile photo</h2>
              <div className="flex items-center gap-xl">
                <Avatar type="initial" initials="AC" size="large" shape="circle" />
                <div className="flex flex-col gap-sm">
                  <Button variant="neutral" size="small">Upload photo</Button>
                  <p className="text-label-sm text-text-tertiary">JPG, PNG, or GIF · Max 4MB</p>
                </div>
              </div>
            </div>

            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Basic information</h2>
              <div className="flex flex-col gap-lg">
                <InputField label="Display name" value={displayName} onChange={setDisplayName} />
                <InputField label="Email address" type="email" value={email} onChange={setEmail} />
                <SelectField
                  label="Timezone"
                  value={timezone}
                  options={[
                    { value: 'america_toronto', label: 'Eastern Time (Toronto)' },
                    { value: 'america_vancouver', label: 'Pacific Time (Vancouver)' },
                    { value: 'america_winnipeg', label: 'Central Time (Winnipeg)' },
                    { value: 'utc', label: 'UTC' },
                  ]}
                  onChange={setTimezone}
                />
              </div>
              <ButtonGroup align="end">
                <Button variant="neutral">Cancel</Button>
                <Button variant="primary">Save changes</Button>
              </ButtonGroup>
            </div>

            {/* Quick link to My Context */}
            <motion.div
              className="rounded-corner-lg p-xl flex items-center gap-lg cursor-pointer"
              style={{
                background: 'color-mix(in srgb, var(--orbi-primary) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)',
              }}
              whileHover={{ borderColor: 'color-mix(in srgb, var(--orbi-primary) 50%, transparent)' }}
              onClick={() => setActiveSection('context')}
            >
              <div className="p-md rounded-corner-md" style={{ background: 'linear-gradient(135deg, var(--orbi-primary), var(--orbi-secondary))' }}>
                <Brain size={18} className="text-white" />
              </div>
              <div className="flex flex-col gap-xs flex-1">
                <p className="text-label text-text-primary">Set up My Context</p>
                <p className="text-label-sm text-text-secondary">
                  Tell Orbi about your career, goals, task types, and ADHD profile for a truly personalised experience
                </p>
              </div>
              <Badge label="Personalise Orbi" variant="brand" />
            </motion.div>
          </div>
        )}

        {/* ── Preferences ── */}
        {activeSection === 'preferences' && (
          <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 48rem)" }}>
            <div className="flex flex-col gap-xs">
              <h1 className="text-title text-text-primary">Preferences</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Customise Orbi to work with your brain</p>
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Appearance</h2>
              <ThemePicker
                current={orbiTheme}
                onPick={setOrbiTheme}
                customTheme={customTheme}
                onCustom={setCustomTheme}
              />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Focus sessions</h2>
              <div className="flex gap-xl">
                <SelectField
                  label="Default focus duration"
                  value={focusDuration}
                  options={[
                    { value: '10', label: '10 minutes' },
                    { value: '15', label: '15 minutes' },
                    { value: '20', label: '20 minutes' },
                    { value: '25', label: '25 minutes' },
                    { value: '45', label: '45 minutes' },
                  ]}
                  onChange={setFocusDuration}
                />
                <SelectField
                  label="Break duration"
                  value={breakDuration}
                  options={[
                    { value: '5', label: '5 minutes' },
                    { value: '10', label: '10 minutes' },
                    { value: '15', label: '15 minutes' },
                  ]}
                  onChange={setBreakDuration}
                />
              </div>
            </div>
            <ButtonGroup align="end">
              <Button variant="neutral">Reset to defaults</Button>
              <Button variant="primary">Save preferences</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Notifications ── */}
        {activeSection === 'notifications' && (
          <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 48rem)" }}>
            <div className="flex flex-col gap-xs">
              <h1 className="text-title text-text-primary">Notifications</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Control when and how Orbi reaches out</p>
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Channels</h2>
              <SwitchField label="Push notifications" description="Receive browser notifications for reminders and check-ins" defaultSelected={notifications} onChange={setNotifications} />
              <SwitchField label="Email digest" description="Weekly summary of your tasks and focus stats" defaultSelected={true} />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid color-mix(in srgb, var(--orbi-secondary) 25%, transparent)' }}>
              <h2 className="text-label text-text-primary">Orbi check-ins</h2>
              <SwitchField label="Proactive check-ins" description="Let Orbi reach out when it thinks you might need help" defaultSelected={true} />
              <SwitchField label="Hyperfocus alerts" description="Alert me if I've been working for 90+ minutes without a break" defaultSelected={true} />
              <SwitchField label="Daily planning prompt" description="Morning nudge to review and plan your day" defaultSelected={false} />
            </div>
          </div>
        )}

        {/* ── Orbi Persona ── */}
        {activeSection === 'persona' && (
          <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 48rem)" }}>
            <div className="flex flex-col gap-xs">
              <h1 className="text-title text-text-primary">Orbi Persona</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Tailor your AI companion's personality</p>
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid color-mix(in srgb, var(--orbi-secondary) 25%, transparent)' }}>
              <h2 className="text-label text-text-primary">Companion name</h2>
              <InputField label="What should your Orbi be called?" value="Orbi" description="Give your AI companion a name that feels right" onChange={() => {}} />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Tone & style</h2>
              <SelectField label="Orbi's tone" value="gentle" options={[
                { value: 'gentle', label: 'Gentle — warm, supportive, patient' },
                { value: 'energetic', label: 'Energetic — enthusiastic, upbeat, motivating' },
                { value: 'focused', label: 'Focused — direct, concise, no fluff' },
                { value: 'playful', label: 'Playful — fun, gamified, emoji-friendly' },
              ]} onChange={() => {}} />
              <SelectField label="Motivation style" value="encouragement" options={[
                { value: 'encouragement', label: 'Encouragement — celebrate every win' },
                { value: 'challenge', label: 'Challenge — push me harder' },
                { value: 'neutral', label: 'Neutral — just the facts' },
              ]} onChange={() => {}} />
            </div>
            <ButtonGroup align="end">
              <Button variant="neutral">Reset persona</Button>
              <Button variant="primary">Save persona</Button>
            </ButtonGroup>
          </div>
        )}

        {/* ── Billing ── */}
        {activeSection === 'billing' && (
          <div className="flex flex-col gap-xl w-full" style={{ maxWidth: "min(92vw, 48rem)" }}>
            <div className="flex flex-col gap-xs">
              <h1 className="text-title text-text-primary">Billing</h1>
              <p className="text-label-sm text-text-secondary mt-xs">Manage your subscription and payment</p>
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid color-mix(in srgb, var(--orbi-secondary) 35%, transparent)', boxShadow: '0 4px 24px color-mix(in srgb, var(--orbi-secondary) 12%, transparent)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-label text-text-primary">Current plan</h2>
                <Badge label="Active" variant="success" />
              </div>
              <div className="rounded-corner-md p-lg flex flex-col gap-md" style={{ background: 'color-mix(in srgb, var(--orbi-secondary) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-secondary) 20%, transparent)' }}>
                <div className="flex items-center gap-md">
                  <Sparkles size={20} className="text-brand-primary" />
                  <div className="flex flex-col gap-xs">
                    <span className="text-label text-text-primary">Orbi Full</span>
                    <span className="text-label-sm text-text-secondary">$24.99 CAD / month</span>
                  </div>
                </div>
                <p className="text-label-sm text-text-secondary">Next billing date: June 10, 2026</p>
              </div>
              <div className="flex gap-md">
                <Button variant="neutral" size="small">Manage plan</Button>
                <Button variant="subtle" size="small">Cancel subscription</Button>
              </div>
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'var(--orbi-surface)', border: '1px solid var(--orbi-border)' }}>
              <h2 className="text-label text-text-primary">Payment method</h2>
              <div className="flex items-center gap-md">
                <div className="rounded-corner-md p-md" style={{ background: 'color-mix(in srgb, var(--orbi-primary) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--orbi-primary) 30%, transparent)' }}>
                  <CreditCard size={18} className="text-brand-primary" />
                </div>
                <div className="flex flex-col gap-xs">
                  <span className="text-label-sm text-text-primary">Visa ending in 4242</span>
                  <span className="text-label-sm text-text-tertiary">Expires 09/2027</span>
                </div>
              </div>
              <Button variant="neutral" size="small">Update payment method</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
