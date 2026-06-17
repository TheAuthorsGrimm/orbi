import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Sparkles, AlertTriangle, ArrowLeft } from 'lucide-react';
import { AstraLogo } from '@figma/astraui';

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared chrome for /terms and /privacy. Public (no auth required),
 * dark theme, fluid scaling, prominent DRAFT banner so nobody mistakes
 * these for lawyer-reviewed final copy.
 */
export function LegalShell({ title, lastUpdated, children }: LegalShellProps) {
  return (
    <main
      className="min-h-screen overflow-y-auto"
      style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
    >
      <div
        className="mx-auto flex flex-col"
        style={{
          maxWidth: 'min(92vw, 56rem)',
          padding: 'clamp(1.5rem, 4vw, 3.5rem) clamp(1rem, 4vw, 4rem)',
          gap: 'clamp(1.5rem, 3vw, 2.5rem)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-md">
          <Link to="/" className="flex items-center gap-sm text-text-secondary hover:text-text-primary transition">
            <ArrowLeft size={16} />
            <span style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}>Back</span>
          </Link>

          <div className="flex items-center gap-sm">
            <AstraLogo size={28} />
            <span
              className="text-white font-bold"
              style={{
                fontFamily: 'Instrument Sans, system-ui, sans-serif',
                fontSize: 'clamp(1.15rem, 2vw, 1.5rem)',
              }}
            >
              Orbi
            </span>
          </div>
        </div>

        {/* DRAFT banner — make absolutely sure nobody treats this as final */}
        <div
          className="rounded-corner-md flex items-start gap-md"
          style={{
            background: 'rgba(217, 119, 6, 0.12)',
            border: '1.5px solid rgba(217, 119, 6, 0.45)',
            padding: 'clamp(0.75rem, 1.5vw, 1rem)',
          }}
        >
          <AlertTriangle size={20} className="shrink-0 mt-0.5" style={{ color: '#fbbf24' }} />
          <div className="flex flex-col gap-xs">
            <p
              className="text-white font-semibold"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1rem)' }}
            >
              Draft — pending legal review
            </p>
            <p
              className="text-text-secondary"
              style={{ fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)', lineHeight: 1.55 }}
            >
              This document is a starter draft. It has not yet been reviewed by a lawyer and is
              not legally binding until a final version is published. Please do not rely on it
              for compliance decisions.
            </p>
          </div>
        </div>

        {/* Title */}
        <div className="flex flex-col gap-xs">
          <h1
            className="text-white font-bold"
            style={{
              fontFamily: 'Instrument Sans, system-ui, sans-serif',
              fontSize: 'clamp(1.75rem, 4.5vw, 3rem)',
              lineHeight: 1.1,
            }}
          >
            {title}
          </h1>
          <p
            className="text-text-secondary"
            style={{ fontSize: 'clamp(0.85rem, 1.4vw, 1rem)' }}
          >
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Body */}
        <article
          className="legal-prose flex flex-col"
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: 'clamp(0.95rem, 1.6vw, 1.1rem)',
            lineHeight: 1.7,
            gap: 'clamp(1.25rem, 2vw, 1.75rem)',
          }}
        >
          {children}
        </article>

        {/* Footer */}
        <div
          className="flex items-center justify-center gap-sm border-t pt-xl"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <Sparkles size={12} className="text-brand-primary" />
          <span
            className="text-text-secondary"
            style={{ fontSize: 'clamp(0.7rem, 1vw, 0.85rem)' }}
          >
            Orbi · by GrimmForged AI Solutions
          </span>
        </div>
      </div>
    </main>
  );
}

interface SectionProps {
  id: string;
  title: string;
  children: ReactNode;
}

export function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="flex flex-col gap-md">
      <h2
        className="text-white font-semibold"
        style={{
          fontFamily: 'Instrument Sans, system-ui, sans-serif',
          fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      <div className="flex flex-col gap-md">{children}</div>
    </section>
  );
}
