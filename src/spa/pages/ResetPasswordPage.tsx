import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { auth as authApi } from '@/spa/api-client';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [redirectSecs, setRedirectSecs] = useState(3);

  useEffect(() => {
    if (!done) return;
    if (redirectSecs <= 0) {
      navigate('/login', { replace: true });
      return;
    }
    const id = window.setTimeout(() => setRedirectSecs((s) => s - 1), 1000);
    return () => window.clearTimeout(id);
  }, [done, redirectSecs, navigate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? 'Could not reset your password. Request a new link.');
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
          {!token ? (
            <div className="flex flex-col gap-md text-center">
              <h1 className="text-heading text-text-primary">Missing reset token</h1>
              <p className="text-label-sm text-text-secondary">
                This page needs a reset token in the URL. Request a new reset link.
              </p>
              <Link
                to="/forgot-password"
                className="text-brand-primary hover:opacity-80 text-label-sm"
              >
                Request a new link
              </Link>
            </div>
          ) : done ? (
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
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h1 className="text-heading text-text-primary">Password updated</h1>
              <p className="text-label-sm text-text-secondary">
                You can sign in with your new password now. Redirecting in {redirectSecs}s…
              </p>
              <Link to="/login" className="text-brand-primary hover:opacity-80 text-label-sm">
                Go to sign in now
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-xs">
                <h1 className="text-heading text-text-primary">Pick a new password</h1>
                <p className="text-label-sm text-text-secondary">
                  At least 8 characters. Longer is better.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
                <InputField
                  label="New password"
                  type="password"
                  value={password}
                  placeholder="At least 8 characters"
                  onChange={setPassword}
                />
                <InputField
                  label="Confirm password"
                  type="password"
                  value={confirm}
                  placeholder="Type it again"
                  onChange={setConfirm}
                />

                {error && <p className="text-label-sm text-red-400">{error}</p>}

                <Button
                  variant="primary"
                  type="submit"
                  className="w-full"
                  disabled={submitting || !password || !confirm}
                >
                  {submitting ? 'Updating…' : 'Update password'}
                </Button>
              </form>
            </>
          )}

          <p className="text-label-sm text-text-secondary text-center">
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
