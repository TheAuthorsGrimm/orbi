import { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Menu, X, ArrowLeft } from 'lucide-react';
import { OrbiSidebar } from './OrbiSidebar';
import { useAuth } from '@/spa/context/AuthContext';
import { useOrbiProfile } from '../../OrbiProfileContext';

// Pages that are treated as top-level "home" surfaces — no back button
// because there's nowhere sensible to go back to.
const TOP_LEVEL_PATHS = new Set(['/dashboard']);

export function AppLayout() {
  const { user, loading } = useAuth();
  const { isOnboarded } = useOrbiProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close the mobile drawer whenever the route changes (post-navigation).
  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  function handleBack() {
    // If there is history to pop, pop it. Otherwise land on the dashboard
    // so people never get stuck.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard', { replace: true });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-tertiary">
        <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const PUBLIC_PATHS = ['/login', '/register', '/terms', '/privacy'];
  const isPublic = PUBLIC_PATHS.includes(location.pathname);

  if (!user && !isPublic) {
    return <Navigate to="/login" replace />;
  }

  if (user && isPublic) {
    return <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />;
  }

  if (user && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  if (user && isOnboarded && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  if (location.pathname === '/onboarding') {
    return (
      <main
        className="min-h-screen overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
      >
        <Outlet />
      </main>
    );
  }

  // Public pages (login, register, terms, privacy): full-screen, no sidebar.
  if (isPublic) {
    return (
      <main
        className="min-h-screen overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
      >
        <Outlet />
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — always visible on md+, slides in on mobile when open. */}
      <div
        className={`md:relative md:translate-x-0 transition-transform duration-200 ease-out fixed inset-y-0 left-0 z-40 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <OrbiSidebar />
      </div>

      {/* Backdrop overlay on mobile when drawer is open. */}
      {mobileNavOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}

      <main
        className="flex-1 overflow-y-auto relative"
        style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
      >
        {/* Mobile-only top bar with hamburger. Hidden on md+. */}
        <div
          className="md:hidden sticky top-0 z-20 flex items-center gap-md px-md py-sm border-b"
          style={{
            background: 'rgba(8, 8, 20, 0.85)',
            backdropFilter: 'blur(12px)',
            borderColor: 'rgba(82, 80, 243, 0.18)',
          }}
        >
          <button
            type="button"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileNavOpen((v) => !v)}
            className="flex items-center justify-center rounded-corner-md text-white"
            style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)' }}
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!TOP_LEVEL_PATHS.has(location.pathname) && (
            <button
              type="button"
              aria-label="Go back"
              onClick={handleBack}
              className="flex items-center justify-center rounded-corner-md text-white"
              style={{ width: 44, height: 44, background: 'rgba(255,255,255,0.06)' }}
            >
              <ArrowLeft size={20} />
            </button>
          )}

          <span
            className="text-white font-bold"
            style={{
              fontFamily: 'Instrument Sans, system-ui, sans-serif',
              fontSize: '1.15rem',
              lineHeight: 1,
            }}
          >
            Orbi
          </span>
        </div>

        {/* Desktop-only inline back button. Shows on md+ when not on a
            top-level page. Stays out of the way visually — small, floats
            over the top-left corner of the content, matches the theme. */}
        {!TOP_LEVEL_PATHS.has(location.pathname) && (
          <button
            type="button"
            aria-label="Go back"
            onClick={handleBack}
            className="hidden md:flex absolute top-lg left-lg z-10 items-center gap-xs px-md py-sm rounded-corner-md text-text-secondary hover:text-white transition"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <ArrowLeft size={14} />
            <span className="text-label-sm">Back</span>
          </button>
        )}

        <Outlet />
      </main>
    </div>
  );
}
