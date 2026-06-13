import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  custom?: boolean;
}

export interface OrbiProfile {
  // About you
  preferredName: string;
  pronouns: string;
  greeting: string; // e.g. "by first name", "by nickname", etc.

  // Career & work
  jobTitle: string;
  industry: string;
  employmentType: string;
  workStyle: string;
  careerNote: string; // free text: what they're working toward career-wise

  // Life context
  lifeRole: string[]; // student, parent, caregiver, freelancer, etc.
  currentFocus: string; // What's most important to you right now?

  // Goals
  shortTermGoal: string;
  mediumTermGoal: string;
  longTermGoal: string;

  // Task categories
  taskCategories: TaskCategory[];

  // ADHD profile
  adhdChallenges: string[];
  adhdStrengths: string[];
  peakHours: string;
  focusHelpers: string[];
  adhdNote: string; // anything else Orbi should know

  // Orbi persona
  orbiName: string;
  orbiTone: string;
  motivationStyle: string;
}

export const DEFAULT_TASK_CATEGORIES: TaskCategory[] = [
  { id: 'work', label: 'Work & Career', emoji: '💼', color: '#5250f3' },
  { id: 'learning', label: 'Learning', emoji: '🎓', color: '#0891b2' },
  { id: 'health', label: 'Health & Wellness', emoji: '🏥', color: '#059669' },
  { id: 'home', label: 'Home & Life', emoji: '🏠', color: '#d97706' },
  { id: 'finance', label: 'Finance', emoji: '💰', color: '#16a34a' },
  { id: 'creative', label: 'Creative', emoji: '🎨', color: '#7c3aed' },
  { id: 'social', label: 'Social', emoji: '🤝', color: '#db2777' },
  { id: 'growth', label: 'Personal Growth', emoji: '🌱', color: '#0d9488' },
  { id: 'sideproject', label: 'Side Project', emoji: '🎯', color: '#ea580c' },
  { id: 'hobbies', label: 'Hobbies & Fun', emoji: '✈️', color: '#9333ea' },
];

export const EMPTY_PROFILE: OrbiProfile = {
  preferredName: '',
  pronouns: '',
  greeting: 'first name',
  jobTitle: '',
  industry: '',
  employmentType: '',
  workStyle: '',
  careerNote: '',
  lifeRole: [],
  currentFocus: '',
  shortTermGoal: '',
  mediumTermGoal: '',
  longTermGoal: '',
  taskCategories: DEFAULT_TASK_CATEGORIES.slice(0, 5),
  adhdChallenges: [],
  adhdStrengths: [],
  peakHours: '',
  focusHelpers: [],
  adhdNote: '',
  orbiName: 'Orbi',
  orbiTone: 'energetic',
  motivationStyle: 'encouragement',
};

// ─── Persistence ──────────────────────────────────────────────────────────────

const PROFILE_KEY_PREFIX = 'orbi-profile';
const ONBOARDED_KEY_PREFIX = 'orbi-onboarded';
const GUEST_ACCOUNT_KEY = 'guest';

function getProfileStorageKey(accountKey: string) {
  return `${PROFILE_KEY_PREFIX}:${accountKey}`;
}

function getOnboardedStorageKey(accountKey: string) {
  return `${ONBOARDED_KEY_PREFIX}:${accountKey}`;
}

function loadProfile(accountKey: string): OrbiProfile {
  try {
    const stored = localStorage.getItem(getProfileStorageKey(accountKey));
    if (stored) return { ...EMPTY_PROFILE, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return { ...EMPTY_PROFILE };
}

function saveProfile(accountKey: string, profile: OrbiProfile) {
  try { localStorage.setItem(getProfileStorageKey(accountKey), JSON.stringify(profile)); } catch { /* ignore */ }
}

function loadOnboarded(accountKey: string): boolean {
  try {
    return localStorage.getItem(getOnboardedStorageKey(accountKey)) === 'true';
  } catch {
    return false;
  }
}

function saveOnboarded(accountKey: string, value: boolean) {
  try { localStorage.setItem(getOnboardedStorageKey(accountKey), String(value)); } catch { /* ignore */ }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface ProfileContextValue {
  profile: OrbiProfile;
  updateProfile: (patch: Partial<OrbiProfile>) => void;
  isOnboarded: boolean;
  markOnboarded: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useOrbiProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useOrbiProfile must be used inside <OrbiProfileProvider>');
  return ctx;
}

export function OrbiProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const accountKey = user?._id || user?.email || GUEST_ACCOUNT_KEY;
  const [profile, setProfile] = useState<OrbiProfile>(() => loadProfile(accountKey));
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => loadOnboarded(accountKey));

  useEffect(() => {
    setProfile(loadProfile(accountKey));
    setIsOnboarded(loadOnboarded(accountKey));
  }, [accountKey]);

  const updateProfile = useCallback((patch: Partial<OrbiProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch };
      saveProfile(accountKey, next);
      return next;
    });
  }, [accountKey]);

  const markOnboarded = useCallback(() => {
    setIsOnboarded(true);
    saveOnboarded(accountKey, true);
  }, [accountKey]);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isOnboarded, markOnboarded }}>
      {children}
    </ProfileContext.Provider>
  );
}
