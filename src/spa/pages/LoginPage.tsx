import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/spa/context/AuthContext';
import { useOrbiProfile } from '../OrbiProfileContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { isOnboarded } = useOrbiProfile();
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [authLoading, isOnboarded, navigate, user]);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-tertiary flex items-center justify-center" style={{ padding: 'clamp(1rem,4vw,4rem)' }}>
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
            <span className="text-title text-text-primary" style={{ fontFamily: 'Instrument Sans, system-ui, sans-serif' }}>
              Orbi
            </span>
          </div>
          <p className="text-label-sm text-text-secondary text-center">
            ADHD Productivity Companion
          </p>
          <div className="flex items-center gap-xs">
            <Sparkles size={12} className="text-brand-primary" />
            <span className="text-video-title text-text-secondary">by GrimmForged AI Solutions</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-surface-bg rounded-corner-lg p-xl flex flex-col gap-lg">
          <form onSubmit={handleLogin} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading text-text-primary">Welcome back</h1>
              <p className="text-label-sm text-text-secondary">
                Sign in to your Orbi workspace
              </p>
            </div>

            <div className="flex flex-col gap-lg">
              <InputField
                label="Email address"
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={setEmail}
              />
              <InputField
                label="Password"
                type="password"
                value={password}
                placeholder="Your password"
                onChange={setPassword}
              />
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-label-sm text-brand-primary hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer">
                Forgot password?
              </button>
            </div>

            {error && <p className="text-label-sm text-red-400">{error}</p>}

            <Button variant="primary" type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-label-sm text-text-secondary text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:opacity-80">
              Create one
            </Link>
          </p>
        </div>

        {/* Tagline */}
        <p className="text-video-title text-text-tertiary text-center italic">
          Built for the ADHD brain. Not around it.
        </p>
      </div>
    </div>
  );
}
