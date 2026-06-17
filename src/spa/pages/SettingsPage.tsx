import { useState } from 'react';
import {
  SecondaryNav, SecondaryNavItem, InputField, SelectField, SwitchField,
  Button, ButtonGroup, Avatar, Badge, useTheme,
} from '@figma/astraui';
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

type SettingsSection = 'profile' | 'context' | 'preferences' | 'notifications' | 'billing' | 'persona';

// ─── Shared editing primitives ────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  gradient = 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
  border = '1px solid rgba(82,80,243,0.25)',
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
          background: 'rgba(255,255,255,0.04)',
          border: '1.5px solid rgba(255,255,255,0.1)',
          fontFamily: 'Atkinson Hyperlegible, sans-serif',
          fontSize: '1rem',
          lineHeight: 1.6,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'rgba(82,80,243,0.5)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />
    </div>
  );
}

function ChipMultiSelect({
  label,
  options,
  selected,
  onChange,
  accent = '#a78bfa',
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
                background: active ? accent + '25' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`,
                color: active ? accent : 'rgba(255,255,255,0.5)',
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
  accent = '#a78bfa',
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
                background: active ? accent + '25' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${active ? accent : 'rgba(255,255,255,0.1)'}`,
                color: active ? accent : 'rgba(255,255,255,0.5)',
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
      <div className="grid grid-cols-5 gap-md">
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
                background: on ? cat.color + '20' : 'rgba(255,255,255,0.03)',
                border: `2px solid ${on ? cat.color : 'rgba(255,255,255,0.07)'}`,
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
                  <X size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
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
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(167,139,250,0.3)' }}
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
                style={{ background: newEmoji === em ? 'rgba(167,139,250,0.2)' : 'transparent', border: `1px solid ${newEmoji === em ? '#a78bfa' : 'transparent'}`, cursor: 'pointer' }}>
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
            <button onClick={addCustom} className="px-lg py-sm rounded-corner-md text-white text-label-sm" style={{ background: '#5250f3', border: 'none', cursor: 'pointer' }}>Add</button>
            <button onClick={() => setAdding(false)} className="px-lg py-sm rounded-corner-md text-label-sm text-text-tertiary" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-md px-lg py-md rounded-corner-md text-label-sm"
          style={{ background: 'rgba(255,255,255,0.03)', border: '2px dashed rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}
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
          accent="#a78bfa"
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
        gradient="linear-gradient(145deg, #1a0e00 0%, #0d0600 100%)"
        border="1px solid rgba(251,146,60,0.2)"
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
          accent="#fb923c"
        />
        <ChipSingleSelect
          label="Where do you work?"
          options={['Fully remote', 'Hybrid', 'In office / on-site', 'On the go / field work', 'Varies']}
          value={profile.workStyle}
          onChange={v => updateProfile({ workStyle: v })}
          accent="#fb923c"
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
        gradient="linear-gradient(145deg, #0a0a1e 0%, #060e18 100%)"
        border="1px solid rgba(82,80,243,0.25)"
      >
        <div
          className="rounded-corner-md p-lg flex flex-col gap-md"
          style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}
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
          style={{ background: 'rgba(20,184,166,0.06)', border: '1px solid rgba(20,184,166,0.2)' }}
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
          style={{ background: 'rgba(82,80,243,0.08)', border: '1px solid rgba(82,80,243,0.2)' }}
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
        gradient="linear-gradient(145deg, #0a1a0a 0%, #060e06 100%)"
        border="1px solid rgba(5,150,105,0.2)"
      >
        <CategoryManager profile={profile} update={updateProfile} />
      </SectionCard>

      {/* ADHD Profile */}
      <SectionCard
        title="Your brain profile"
        gradient="linear-gradient(145deg, #1a0a1e 0%, #0e060e 100%)"
        border="1px solid rgba(167,139,250,0.25)"
      >
        <div
          className="rounded-corner-md px-lg py-md"
          style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)' }}
        >
          <p className="text-label-sm" style={{ color: '#a78bfa' }}>
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
          accent="#f472b6"
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
          accent="#6ee7b7"
        />

        <ChipSingleSelect
          label="When is your brain at its best?"
          options={['Morning (6–12pm)', 'Afternoon (12–5pm)', 'Evening (5–9pm)', 'Night owl (9pm–2am)', 'Varies wildly']}
          value={profile.peakHours}
          onChange={v => updateProfile({ peakHours: v })}
          accent="#fcd34d"
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
          accent="#38bdf8"
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
  const { theme, setTheme } = useTheme();

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
        className="flex-1 p-2xl overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
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

            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
              <h2 className="text-label text-text-primary">Profile photo</h2>
              <div className="flex items-center gap-xl">
                <Avatar type="initial" initials="AC" size="large" shape="circle" />
                <div className="flex flex-col gap-sm">
                  <Button variant="neutral" size="small">Upload photo</Button>
                  <p className="text-label-sm text-text-tertiary">JPG, PNG, or GIF · Max 4MB</p>
                </div>
              </div>
            </div>

            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
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
                background: 'linear-gradient(145deg, rgba(82,80,243,0.1), rgba(13,148,136,0.08))',
                border: '1px solid rgba(82,80,243,0.3)',
              }}
              whileHover={{ borderColor: 'rgba(82,80,243,0.5)' }}
              onClick={() => setActiveSection('context')}
            >
              <div className="p-md rounded-corner-md" style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}>
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
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
              <h2 className="text-label text-text-primary">Appearance</h2>
              <SelectField
                label="Theme"
                value={theme === 'dark' ? 'dark' : 'light'}
                options={[
                  { value: 'dark', label: 'Dark (recommended for ADHD)' },
                  { value: 'light', label: 'Light' },
                ]}
                onChange={(val) => setTheme(val as 'dark' | 'light')}
              />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
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
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
              <h2 className="text-label text-text-primary">Channels</h2>
              <SwitchField label="Push notifications" description="Receive browser notifications for reminders and check-ins" defaultSelected={notifications} onChange={setNotifications} />
              <SwitchField label="Email digest" description="Weekly summary of your tasks and focus stats" defaultSelected={true} />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #031a17 0%, #021210 100%)', border: '1px solid rgba(13,148,136,0.25)' }}>
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
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #031a17 0%, #021210 100%)', border: '1px solid rgba(13,148,136,0.25)' }}>
              <h2 className="text-label text-text-primary">Companion name</h2>
              <InputField label="What should your Orbi be called?" value="Orbi" description="Give your AI companion a name that feels right" onChange={() => {}} />
            </div>
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
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
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #031a17 0%, #021210 100%)', border: '1px solid rgba(13,148,136,0.35)', boxShadow: '0 4px 24px rgba(13,148,136,0.12)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-label text-text-primary">Current plan</h2>
                <Badge label="Active" variant="success" />
              </div>
              <div className="rounded-corner-md p-lg flex flex-col gap-md" style={{ background: 'rgba(13,148,136,0.08)', border: '1px solid rgba(13,148,136,0.2)' }}>
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
            <div className="rounded-corner-lg p-xl flex flex-col gap-lg" style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.25)' }}>
              <h2 className="text-label text-text-primary">Payment method</h2>
              <div className="flex items-center gap-md">
                <div className="rounded-corner-md p-md" style={{ background: 'rgba(82,80,243,0.15)', border: '1px solid rgba(82,80,243,0.3)' }}>
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
