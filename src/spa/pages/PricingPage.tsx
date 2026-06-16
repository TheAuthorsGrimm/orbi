import { Button, Badge } from '@figma/astraui';
import { CheckCircle2, Sparkles, Bot, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const TIERS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    icon: Zap,
    badge: null,
    description: 'Get started with ADHD-friendly task planning',
    gradient: 'linear-gradient(145deg, #0a0a18 0%, #0e0d20 100%)',
    border: '1px solid rgba(255,255,255,0.1)',
    accent: '#a5b4fc',
    iconGradient: 'linear-gradient(135deg, #3730a3, #4338ca)',
    current: false,
    features: ['Task Planner', 'Calendar View', 'Basic task breakdown', 'Up to 5 active tasks'],
    cta: 'Get started free',
    ctaVariant: 'neutral' as const,
  },
  {
    id: 'agent',
    name: 'Orbi Agent',
    price: 9.99,
    icon: Bot,
    badge: 'Most Popular',
    description: 'AI-powered ADHD support with Claude',
    gradient: 'linear-gradient(145deg, #0f0e2a 0%, #1a1040 100%)',
    border: '1px solid rgba(82,80,243,0.5)',
    accent: '#c4b5fd',
    iconGradient: 'linear-gradient(135deg, #5250f3, #7c3aed)',
    current: false,
    features: [
      'Everything in Free',
      'AI Agent Orbi (Claude-powered)',
      'Proactive check-ins',
      'Task decomposition AI',
      'Focus session guidance',
      'Unlimited tasks',
    ],
    cta: 'Upgrade to Agent',
    ctaVariant: 'primary' as const,
  },
  {
    id: 'full',
    name: 'Orbi Full',
    price: 24.99,
    icon: Sparkles,
    badge: 'All features',
    description: 'The complete ADHD companion experience',
    gradient: 'linear-gradient(145deg, #031a17 0%, #0a2a2a 100%)',
    border: '1px solid rgba(13,148,136,0.5)',
    accent: '#5eead4',
    iconGradient: 'linear-gradient(135deg, #0d9488, #0891b2)',
    current: true,
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
    cta: 'Current plan ✓',
    ctaVariant: 'primary' as const,
  },
];

export function PricingPage() {
  return (
    <div className="p-xl flex flex-col gap-xl">
      {/* Header */}
      <div className="flex flex-col items-center gap-xs text-center">
        <h1 className="text-title text-text-primary">Plans built for the ADHD brain</h1>
        <p className="text-label-sm text-text-secondary">
          Start free, upgrade when you're ready. No pressure — Orbi won't guilt trip you.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="flex gap-xl justify-center">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex flex-col gap-xl flex-1 max-w-xs rounded-corner-lg p-xl"
              style={{
                background: tier.gradient,
                border: tier.border,
                boxShadow: tier.current ? '0 4px 40px rgba(13,148,136,0.2)' : tier.id === 'agent' ? '0 4px 40px rgba(82,80,243,0.2)' : 'none',
              }}
            >
              {/* Top */}
              <div className="flex flex-col gap-lg">
                <div className="flex items-start justify-between">
                  <div
                    className="w-12 h-12 rounded-corner-md flex items-center justify-center"
                    style={{ background: tier.iconGradient, boxShadow: `0 0 16px ${tier.accent}44` }}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  {tier.badge && (
                    <Badge label={tier.badge} variant={tier.current ? 'success' : 'brand'} />
                  )}
                  {tier.current && !tier.badge && (
                    <Badge label="Your plan" variant="success" />
                  )}
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
                    <span className="text-label-sm text-text-secondary">CAD/mo</span>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${tier.accent}33, transparent)` }} />

              {/* Features */}
              <div className="flex flex-col gap-md flex-1">
                <p className="text-label-sm text-text-tertiary">What's included</p>
                {tier.features.map(feature => (
                  <div key={feature} className="flex items-start gap-md">
                    <CheckCircle2 size={15} style={{ color: tier.accent }} className="mt-xs flex-shrink-0" />
                    <span className="text-label-sm text-text-primary">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Button
                variant={tier.ctaVariant}
                disabled={tier.current}
                className="w-full"
              >
                {tier.cta}
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* FAQ */}
      <div
        className="rounded-corner-lg p-xl flex flex-col gap-lg max-w-2xl mx-auto w-full"
        style={{ background: 'linear-gradient(145deg, #0f0e2a 0%, #0a0a18 100%)', border: '1px solid rgba(82,80,243,0.2)' }}
      >
        <h2 className="text-label text-text-primary">Before you commit</h2>
        <div className="flex flex-col gap-lg">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings. No dark patterns, no guilt trips. You keep your data.' },
            { q: 'Is there a free trial for paid tiers?', a: 'The free plan is permanent. If you upgrade, you have 7 days to request a refund if it\'s not working for you.' },
            { q: 'Who is Orbi for?', a: 'Primarily people with ADHD, but anyone who struggles with executive dysfunction, task paralysis, or motivation will benefit.' },
            { q: 'Is my data private?', a: 'Your task data and AI conversations are private and not used to train models. Payments processed securely via Stripe.' },
          ].map(item => (
            <div key={item.q} className="flex flex-col gap-xs" style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-label text-text-primary">{item.q}</span>
              <p className="text-label-sm text-text-secondary">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-label-sm text-text-tertiary text-center">
        Payments processed securely via Stripe in Canadian dollars (CAD) · Built with ❤️ and hyperfocus by GrimmForged
      </p>
    </div>
  );
}
