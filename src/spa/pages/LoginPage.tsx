import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/spa/context/AuthContext';
import { useOrbiProfile } from '../OrbiProfileContext';
import './LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();
  const { isOnboarded } = useOrbiProfile();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwErr, setPwErr]       = useState('');
  const [submitting, setSubmitting] = useState(false);

  const ownerEmail    = process.env.NEXT_PUBLIC_OWNER_EMAIL;
  const ownerPassword = process.env.NEXT_PUBLIC_OWNER_PASSWORD;
  const ownerBypassEnabled = !!(ownerEmail && ownerPassword);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [authLoading, isOnboarded, navigate, user]);

  async function handleOwnerBypass() {
    if (!ownerEmail || !ownerPassword) return;
    setError('');
    setSubmitting(true);
    try {
      await login(ownerEmail, ownerPassword);
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    } catch {
      setError('Owner bypass failed — check NEXT_PUBLIC_OWNER_EMAIL / NEXT_PUBLIC_OWNER_PASSWORD.');
    } finally {
      setSubmitting(false);
    }
  }

  function validate(): boolean {
    let ok = true;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setEmailErr('Enter a valid email address.');
      ok = false;
    } else {
      setEmailErr('');
    }
    if (!password) {
      setPwErr('Enter your password.');
      ok = false;
    } else {
      setPwErr('');
    }
    return ok;
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!validate()) return;
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
    <div className="lp-root">

      {/* Nav */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <span className="lp-wordmark">Orbi<em>.</em></span>
        </div>
      </header>

      {/* Two-column layout */}
      <main className="lp-main">

        {/* Left: editorial */}
        <div className="lp-editorial">
          <span className="lp-ghost" aria-hidden="true">O</span>
          <div className="lp-eyebrow">Welcome back</div>
          <h1 className="lp-title">Your focus<br />is waiting.</h1>
          <p className="lp-sub">
            Pick up exactly where you left off. Your tasks, your streak, your progress — all here.
          </p>
        </div>

        {/* Right: form */}
        <div className="lp-card" role="main" aria-label="Sign in">
          <h2 className="lp-form-heading">Sign in</h2>
          <p className="lp-form-sub">
            New to Orbi? <Link to="/register">Create an account →</Link>
          </p>

          {/* SSO — wired up when OAuth is ready */}
          <div className="lp-sso-row">
            <button type="button" className="lp-sso-btn" aria-label="Sign in with Google">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className="lp-sso-btn" aria-label="Sign in with Microsoft">
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect x="0" y="0" width="8.5" height="8.5" fill="#f25022"/>
                <rect x="9.5" y="0" width="8.5" height="8.5" fill="#7fba00"/>
                <rect x="0" y="9.5" width="8.5" height="8.5" fill="#00a4ef"/>
                <rect x="9.5" y="9.5" width="8.5" height="8.5" fill="#ffb900"/>
              </svg>
              Continue with Microsoft
            </button>
          </div>

          <div className="lp-divider">or sign in with email</div>

          {error && (
            <div className="lp-error-banner" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className="lp-field-group">

              <div className="lp-field">
                <label htmlFor="lp-email" className="lp-label">Email address</label>
                <div className="lp-field-row">
                  <input
                    id="lp-email"
                    type="email"
                    className={`lp-input${emailErr ? ' error' : ''}`}
                    value={email}
                    onChange={e => { setEmail(e.target.value); setEmailErr(''); setError(''); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-describedby={emailErr ? 'lp-email-err' : undefined}
                    required
                  />
                </div>
                {emailErr && <span id="lp-email-err" className="lp-field-error">{emailErr}</span>}
              </div>

              <div className="lp-field">
                <label htmlFor="lp-password" className="lp-label">Password</label>
                <div className="lp-field-row">
                  <input
                    id="lp-password"
                    type={showPw ? 'text' : 'password'}
                    className={`lp-input${pwErr ? ' error' : ''}`}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPwErr(''); setError(''); }}
                    placeholder="Your password"
                    autoComplete="current-password"
                    aria-describedby={pwErr ? 'lp-pw-err' : undefined}
                    required
                  />
                  <button
                    type="button"
                    className="lp-pw-toggle"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                    aria-pressed={showPw}
                  >
                    {showPw ? 'Hide' : 'Show'}
                  </button>
                </div>
                {pwErr && <span id="lp-pw-err" className="lp-field-error">{pwErr}</span>}
              </div>

            </div>

            <div className="lp-meta-row">
              <label className="lp-check-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Keep me signed in
              </label>
              <button type="button" className="lp-forgot">Forgot password?</button>
            </div>

            <button type="submit" className="lp-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="lp-spinner" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <span className="lp-submit-arrow" aria-hidden="true">→</span>
                </>
              )}
            </button>

            {ownerBypassEnabled && (
              <button
                type="button"
                className="lp-bypass"
                onClick={handleOwnerBypass}
                disabled={submitting}
              >
                ⚡ Owner access
              </button>
            )}
          </form>

          <div className="lp-security">
            <div className="lp-security-dot" aria-hidden="true" />
            <span>End-to-end encrypted · Your data stays yours</span>
          </div>
        </div>

      </main>

      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <ul className="lp-footer-links">
            <li><Link to="/terms">Terms</Link></li>
            <li><Link to="/privacy">Privacy</Link></li>
          </ul>
          <span className="lp-footer-sig">Less, but better.</span>
        </div>
      </footer>

    </div>
  );
}
