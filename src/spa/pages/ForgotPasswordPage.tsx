import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { Sparkles, Mail } from 'lucide-react';
import { auth as authApi } from '@/spa/api-client';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await authApi.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-brand-tertiary flex items-center justify-center"
      style={{ padding: 'clamp(1rem,4vw,4rem)' }}
    >
      <div
        className="w-full flex flex-col"
        style={{
          maxWidth: 'min(92vw, 36rem)',
          gap: 'clamp(1.25rem, 3vw, 2.5rem)',
        }}
      >
        {/* Logo + Branding */}
        <div className="flex flex-col items-center gap-md">
          <div className="flex items-center gap-md">
            <AstraLogo size={36} />
            <span
              className="text-title text-text-primary"
              style={{ fontFamily: 'Instrument Sans, system-ui, sans-serif' }}
            >
              Orbi
            </span>
          </div>
          <div className="flex items-center gap-xs">
            <Sparkles size={12} className="text-brand-primary" />
            <span className="text-video-title text-text-secondary">by GrimmForged AI Solutions</span>
          </div>
        </div>

        <div className="bg-surface-bg rounded-corner-lg p-xl flex flex-col gap-lg">
          {submitted ? (
            <div className="flex flex-col items-center gap-md text-center">
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: 64,
                  height: 64,
                  background: 'linear-gradient(135deg, #5250f3, #0d9488)',
                  boxShadow: '0 0 24px rgba(82,80,243,0.4)',
                }}
              >
                <Mail size={28} className="text-white" />
              </div>
              <h1 className="text-heading text-text-primary">Check your email</h1>
              <p className="text-label-sm text-text-secondary">
                If an Orbi account exists for <strong>{email}</strong>, we've sent a link to reset
                your password. It expires in 1 hour.
              </p>
              <p className="text-label-sm text-text-tertiary">
                Didn't get it? Check spam, or wait a minute and try again.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-xs">
                <h1 className="text-heading text-text-primary">Forgot password</h1>
                <p className="text-label-sm text-text-secondary">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                <InputField
                  label="Email"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={setEmail}
                />

                {error && <p className="text-label-sm text-red-400">{error}</p>}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  disabled={submitting || !email.trim()}
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            </>
          )}

          <p className="text-label-sm text-text-secondary text-center">
            Remembered it?{' '}
            <Link to="/login" className="text-brand-primary hover:opacity-80">
              Back to sign in
            </Link>
          </p>
        </div>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-md text-text-tertiary">
          <Link
            to="/terms"
            className="hover:text-text-primary transition"
            style={{ fontSize: 'clamp(0.7rem, 1vw, 0.8rem)' }}
          >
            Terms
          </Link>
          <span style={{ opacity: 0.4 }}>·</span>
          <Link
            to="/privacy"
            className="hover:text-text-primary transition"
            style={{ fontSize: 'clamp(0.7rem, 1vw, 0.8rem)' }}
          >
            Privacy
          </Link>
        </div>
      </div>
    </div>
  );
}
