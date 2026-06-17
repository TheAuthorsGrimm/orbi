import { Navigate, Outlet, useLocation } from 'react-router';
import { OrbiSidebar } from './OrbiSidebar';
import { useAuth } from '@/spa/context/AuthContext';
import { useOrbiProfile } from '../../OrbiProfileContext';

export function AppLayout() {
  const { user, loading } = useAuth();
  const { isOnboarded } = useOrbiProfile();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-brand-tertiary">
        <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const PUBLIC_PATHS = ['/login', '/register'];
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

  // Public pages (login, register): full-screen, no sidebar.
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
      <OrbiSidebar />

      <main
        className="flex-1 overflow-y-auto"
        style={{ background: 'linear-gradient(160deg, #080814 0%, #0a0a1a 50%, #080e14 100%)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
