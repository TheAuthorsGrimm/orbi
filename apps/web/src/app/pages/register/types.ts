/** Shared state across all signup steps */
export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  selectedTier: TierId;
}

export type TierId = 'free' | 'agent' | 'full';

export type TourChoice = 'self-explore' | 'quick-tour' | 'full-tour';

export interface TierInfo {
  id: TierId;
  name: string;
  price: number;
  tagline: string;
  icon: string;
  features: string[];
  color: string;
}

export const TIERS: TierInfo[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    tagline: 'ADHD-friendly planning basics',
    icon: '⚡',
    color: '#a5b4fc',
    features: [
      'Task Planner',
      'Calendar View',
      'Basic task breakdown',
      'Up to 5 active tasks',
    ],
  },
  {
    id: 'agent',
    name: 'Orbi Agent',
    price: 9.99,
    tagline: 'AI-powered ADHD support',
    icon: '🤖',
    color: '#c4b5fd',
    features: [
      'Everything in Free',
      'AI Agent Orbi (Claude-powered)',
      'Proactive check-ins',
      'Task decomposition AI',
      'Focus session guidance',
      'Unlimited tasks',
    ],
  },
  {
    id: 'full',
    name: 'Orbi Full',
    price: 24.99,
    tagline: 'The complete ADHD companion',
    icon: '✨',
    color: '#5eead4',
    features: [
      'Everything in Agent',
      'Smart Reminders',
      'Tailored Orbi Persona',
      'Hyperfocus protection',
      'Google Calendar sync',
      'Gmail integration',
      'Mood & energy tracking',
      'Weekly ADHD-aware insights',
    ],
  },
];
