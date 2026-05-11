import { Outlet } from 'react-router';
import { OrbiSidebar } from './OrbiSidebar';

export function AppLayout() {
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
