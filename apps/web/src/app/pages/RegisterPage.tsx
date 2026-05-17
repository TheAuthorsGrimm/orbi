import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrbiProfile } from '../OrbiProfileContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const { isOnboarded } = useOrbiProfile();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [authLoading, isOnboarded, navigate, user]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (name.trim().length < 2) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register(email, password, name.trim());
      navigate('/onboarding', { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(message ?? 'Registration failed. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-brand-tertiary flex items-center justify-center p-2xl">
      <div className="w-full max-w-md flex flex-col gap-xl">
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
          <form onSubmit={handleRegister} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading text-text-primary">Create your account</h1>
              <p className="text-label-sm text-text-secondary">
                Start free — no credit card required
              </p>
            </div>

            <div className="flex flex-col gap-lg">
              <InputField
                label="Display name"
                value={name}
                placeholder="How should Orbi call you?"
                onChange={setName}
              />
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
                placeholder="At least 8 characters"
                onChange={setPassword}
              />
            </div>

            {error && <p className="text-label-sm text-red-400">{error}</p>}

            <Button variant="primary" type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-label-sm text-text-secondary text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-primary hover:opacity-80">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-video-title text-text-tertiary text-center">
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}