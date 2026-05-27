import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { ArrowLeft, ArrowRight, Bot, CheckCircle2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrbiProfile } from '../OrbiProfileContext';

type SignupStep = 0 | 1 | 2;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, user, loading: authLoading } = useAuth();
  const { isOnboarded } = useOrbiProfile();
  const [step, setStep] = useState<SignupStep>(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [affirmation, setAffirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const cleanName = name.trim();
  const isNameValid = cleanName.length >= 2;
  const isEmailValid = EMAIL_PATTERN.test(email.trim());
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[A-Za-z]/.test(password),
    number: /\d/.test(password),
  };
  const isPasswordValid = passwordChecks.length && passwordChecks.letter && passwordChecks.number;

  const canContinue = step === 0
    ? isNameValid
    : step === 1
      ? isEmailValid
      : isPasswordValid;

  const assistantMessage = step === 0
    ? 'Welcome to Orbi. Share the name you prefer, and I will personalize support in a way that respects your identity.'
    : step === 1
      ? 'Great start. Add your email so your workspace stays secure and always connected to your account.'
      : 'You are almost in. Create a strong password so your progress and personal data stay protected.';

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [authLoading, isOnboarded, navigate, user]);

  function advanceStep() {
    if (canContinue) {
      setError('');
      if (step === 0) {
        setAffirmation(`Lovely start${cleanName ? `, ${cleanName}` : ''}. You are doing great.`);
      } else if (step === 1) {
        setAffirmation('Perfect. Your account details are coming together beautifully.');
      }
      setStep(prev => (prev < 2 ? ((prev + 1) as SignupStep) : prev));
      return;
    }

    if (step === 0) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (step === 1) {
      setError('Enter a valid email address to continue.');
      return;
    }
    setError('Password must be at least 8 characters and include a letter and a number.');
  }

  function goBackStep() {
    setError('');
    setAffirmation('');
    setStep(prev => (prev > 0 ? ((prev - 1) as SignupStep) : prev));
  }

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!isNameValid) {
      setError('Display name must be at least 2 characters.');
      return;
    }
    if (!isEmailValid) {
      setError('Enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be at least 8 characters and include a letter and a number.');
      return;
    }
    setAffirmation('Excellent. Your secure account is ready to be created.');
    setSubmitting(true);
    try {
      await register(email.trim(), password, cleanName);
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
          <div className="rounded-corner-md border border-white/10 bg-white/5 p-md flex gap-sm">
            <div className="h-9 w-9 rounded-full grid place-items-center text-white" style={{ background: 'linear-gradient(135deg, #5250f3, #0d9488)' }}>
              <Bot size={16} />
            </div>
            <div className="flex-1">
              <p className="text-label text-text-primary">Orbi Assistant</p>
              <p className="text-label-sm text-text-secondary mt-1">{assistantMessage}</p>
            </div>
          </div>

          <div className="flex items-center gap-sm">
            {[0, 1, 2].map((stepIndex) => {
              const complete = stepIndex < step;
              const active = stepIndex === step;
              return (
                <div
                  key={stepIndex}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    background: complete || active
                      ? 'linear-gradient(90deg, #5250f3, #0d9488)'
                      : 'rgba(255, 255, 255, 0.15)',
                    opacity: active || complete ? 1 : 0.8,
                  }}
                />
              );
            })}
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <h1 className="text-heading text-text-primary">Create your account</h1>
              <p className="text-label-sm text-text-secondary">
                Start free in under a minute with guided setup
              </p>
            </div>

            <div className="flex flex-col gap-lg">
              {step === 0 && (
                <div className="grid gap-2">
                  <InputField
                    label="Display name"
                    value={name}
                    placeholder="Name Orbi should use"
                    onChange={setName}
                  />
                  <p className="text-label-sm text-text-secondary">
                    Orbi will use your chosen name and supportive, inclusive language.
                  </p>
                </div>
              )}

              {step === 1 && (
                <InputField
                  label="Email address"
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={setEmail}
                />
              )}

              {step === 2 && (
                <InputField
                  label="Password"
                  type="password"
                  value={password}
                  placeholder="At least 8 characters, with letters and numbers"
                  onChange={setPassword}
                />
              )}
            </div>

            {step === 2 && (
              <div className="grid gap-1">
                <p className="text-label-sm text-text-secondary">Password checklist</p>
                <p className={`text-label-sm ${passwordChecks.length ? 'text-emerald-400' : 'text-text-secondary'}`}>
                  <CheckCircle2 size={12} className="inline mr-1" />
                  Minimum 8 characters
                </p>
                <p className={`text-label-sm ${passwordChecks.letter ? 'text-emerald-400' : 'text-text-secondary'}`}>
                  <CheckCircle2 size={12} className="inline mr-1" />
                  Includes a letter
                </p>
                <p className={`text-label-sm ${passwordChecks.number ? 'text-emerald-400' : 'text-text-secondary'}`}>
                  <CheckCircle2 size={12} className="inline mr-1" />
                  Includes a number
                </p>
              </div>
            )}

            {error && <p className="text-label-sm text-red-400">{error}</p>}

            {affirmation && !error && (
              <p className="text-label-sm text-emerald-300">{affirmation}</p>
            )}

            <div className="flex gap-sm">
              <Button
                variant="neutral"
                type="button"
                className="flex-1"
                onClick={goBackStep}
                disabled={step === 0 || submitting}
              >
                <ArrowLeft size={14} />
                Back
              </Button>

              {step < 2 ? (
                <Button
                  variant="primary"
                  type="button"
                  className="flex-1"
                  onClick={advanceStep}
                  disabled={submitting}
                >
                  Next
                  <ArrowRight size={14} />
                </Button>
              ) : (
                <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Creating account…' : 'Create account'}
                </Button>
              )}
            </div>
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