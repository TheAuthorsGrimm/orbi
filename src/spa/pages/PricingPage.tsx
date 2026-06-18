import { useState } from 'react';
import { Button, Badge } from '@figma/astraui';
import { CheckCircle2, Sparkles, Bot, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { subscriptions } from '@/spa/api-client';
import { useAuth } from '@/spa/context/AuthContext';

type TierId = 'free' | 'agent' | 'full';

const TIERS = [
  {
    id: 'free' as TierId,
    name: 'Free',
    price: 0,
    icon: Zap,
    badge: null as string | null,
    description: 'Get started with ADHD-friendly task planning',
    gradient: 'linear-gradient(145deg, #0a0a18 0%, #0e0d20 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    accent: '#a5b4fc',
    iconGradient: 'linear-gradient(135deg, #3730a3, #4338ca)',
    features: ['Task Planner', 'Calendar View', 'Basic task breakdown', 'Up to 5 active tasks'],
    ctaVariant: 'neutral' as const,
  },
  {
    id: 'agent' as TierId,
    name: 'Orbi Agent',
    price: 9.99,
    icon: Bot,
    badge: 'Most Popular' as string | null,
    description: 'AI-powered ADHD support with Claude',
    gradient: 'linear-gradient(145deg, #0f0e2a 0%, #1a1040 100%)',
    border: '1px solid rgba(82,80,243,0.5)',
    accent: '#c4b5fd',
    iconGradient: 'linear-gradient(135deg, #5250f3, #7c3aed)',
    features: [
      'Everything in Free',
      'AI Agent Orbi (Claude-powered)',
      'Proactive check-ins',
      'Task decomposition AI',
      'Focus session guidance',
      'Unlimited tasks',
    ],
    ctaVariant: 'primary' as const,
  },
  {
    id: 'full' as TierId,
    name: 'Orbi Full',
    price: 24.99,
    icon: Sparkles,
    badge: 'All features' as string | null,
    description: 'The complete ADHD companion experience',
    gradient: 'linear-gradient(145deg, #031a17 0%, #0a2a2a 100%)',
    border: '1px solid rgba(13,148,136,0.5)',
    accent: '#5eead4',
    iconGradient: 'linear-gradient(135deg, #0d9488, #0891b2)',
    features: [
      'Everything in Agent',
      'Smart Reminders (context-aware)',
      'Tailored Orbi Persona',
      'Hyperfocus protection mode',
      'Google Calendar sync',
      'Gmail integration',
      'Mood & energy tracking',
      'Weekly ADHD-aware insights',
    ],
    ctaVariant: 'primary' as const,
  },
];

export function PricingPage() {
  const { user } = useAuth();
  const currentTier = (user?.tier ?? 'free') as TierId;
  const [pendingTier, setPendingTier] = useState<TierId | null>(null);
  const [error, setError] = useState<string | null>(null);

  function ctaLabel(tier: TierId): string {
    if (tier === currentTier) return 'Current plan ✓';
    if (tier === 'free') return 'Downgrade';
    if (currentTier === 'free') {
      return tier === 'agent' ? 'Upgrade to Agent' : 'Upgrade to Full';
    }
    // moving between paid tiers
    return tier === 'agent' ? 'Switch to Agent' : 'Switch to Full';
  }

  async function handleUpgrade(tier: TierId) {
    if (tier === 'free' || tier === currentTier) return;
    setPendingTier(tier);
    setError(null);
    try {
      const res = await subscriptions.checkout(tier);
      const url = res.data.data?.url;
      if (url) {
        window.location.href = url;
        return;
      }
      setError('Could not start checkout. Please try again in a moment.');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? 'Checkout failed. Please try again.');
    } finally {
      setPendingTier(null);
    }
  }

  return (
    <div className="p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-xs text-center">
        <h1 className="text-title text-text-primary">Plans built for the ADHD brain</h1>
        <p className="text-label-sm text-text-secondary">
          Start free, upgrade when you're ready. No pressure — Orbi won't guilt trip you.
        </p>
      </div>

      {error && (
        <div
          className="rounded-corner-md p-md text-center mx-auto"
          style={{
            background: 'rgba(220, 38, 38, 0.12)',
            border: '1.5px solid rgba(220, 38, 38, 0.4)',
            color: '#fca5a5',
            maxWidth: 'min(92vw, 36rem)',
          }}
        >
          {error}
        </div>
      )}

      {/* Pricing Cards */}
      <div className="flex gap-xl justify-center flex-wrap">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isCurrent = tier.id === currentTier;
          const isPending = pendingTier === tier.id;
          const showCurrentBadge = isCurrent;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-corner-lg p-xl flex flex-col gap-lg flex-1"
              style={{
                background: tier.gradient,
                border: tier.border,
                boxShadow: isCurrent
                  ? '0 4px 40px rgba(13,148,136,0.2)'
                  : tier.id === 'agent'
                    ? '0 4px 40px rgba(82,80,243,0.2)'
                    : 'none',
                maxWidth: 'min(92vw, 24rem)',
                minWidth: 'min(92vw, 18rem)',
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className="rounded-corner-md p-md"
                  style={{ background: tier.iconGradient, boxShadow: `0 0 16px ${tier.accent}44` }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex flex-col items-end gap-xs">
                  {showCurrentBadge && <Badge label="Current" variant="success" />}
                  {!showCurrentBadge && tier.badge && <Badge label={tier.badge} variant="brand" />}
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <h2 className="text-label text-text-primary">{tier.name}</h2>
                <p className="text-label-sm text-text-secondary">{tier.description}</p>
              </div>

              <div className="flex items-baseline gap-xs">
                <span className="text-title" style={{ color: tier.accent }}>
                  {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
                </span>
                {tier.price > 0 && (
                  <span className="text-label-sm text-text-secondary">CAD / month</span>
                )}
              </div>

              <div
                style={{
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${tier.accent}33, transparent)`,
                }}
              />

              <div className="flex flex-col gap-sm flex-1">
                {tier.features.map(feature => (
                  <div key={feature} className="flex items-start gap-sm">
                    <CheckCircle2 size={15} style={{ color: tier.accent }} className="mt-xs flex-shrink-0" />
                    <span className="text-label-sm text-text-primary">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={tier.ctaVariant}
                disabled={isCurrent || isPending || tier.id === 'free'}
                className="w-full"
                onClick={() => handleUpgrade(tier.id)}
              >
                {isPending ? 'Redirecting…' : ctaLabel(tier.id)}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <div
        className="rounded-corner-lg p-xl flex flex-col gap-lg mx-auto w-full"
        style={{
          background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)',
          border: '1px solid rgba(82,80,243,0.2)',
          maxWidth: 'min(92vw, 48rem)',
        }}
      >
        <h2 className="text-label text-text-primary">Before you commit</h2>
        <div className="flex flex-col gap-lg">
          <div className="flex flex-col gap-xs">
            <h3 className="text-label-sm text-text-primary">Cancel anytime</h3>
            <p className="text-label-sm text-text-secondary">
              Use the billing portal from Settings → Billing to cancel or change plans. No phone
              call required.
            </p>
          </div>
          <div className="flex flex-col gap-xs">
            <h3 className="text-label-sm text-text-primary">Secure payments</h3>
            <p className="text-label-sm text-text-secondary">
              Payments are processed by Stripe in CAD. We never see or store your card details.
            </p>
          </div>
          <div className="flex flex-col gap-xs">
            <h3 className="text-label-sm text-text-primary">Refunds</h3>
            <p className="text-label-sm text-text-secondary">
              If you cancel mid-cycle you keep access until the end of the period. See our{' '}
              <a href="#/terms" className="text-brand-primary hover:opacity-80">
                Terms of Service
              </a>{' '}
              for the full refund policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
