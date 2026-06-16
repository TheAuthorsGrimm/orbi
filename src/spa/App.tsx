'use client';

import { RouterProvider } from 'react-router';
import { ThemeProvider, useTheme } from '@figma/astraui';
import { router } from './routes';
import { useEffect } from 'react';
import { RewardProvider } from './RewardSystem';
import { OrbiProfileProvider } from './OrbiProfileContext';
import { AuthProvider } from '@/spa/context/AuthContext';

// Sets dark as the default on first visit (Orbi is dark-by-default)
function DarkModeDefaulter() {
  const { setTheme } = useTheme();
  useEffect(() => {
    if (!localStorage.getItem('astra-theme')) {
      setTheme('dark');
    }
  }, []);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <DarkModeDefaulter />
      <AuthProvider>
        <OrbiProfileProvider>
          <RewardProvider>
            <RouterProvider router={router} />
          </RewardProvider>
        </OrbiProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}