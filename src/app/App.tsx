import { RouterProvider } from 'react-router';
import { ThemeProvider, useTheme } from '@figma/astraui';
import { router } from './routes';
import { useEffect } from 'react';
import { RewardProvider } from './components/RewardSystem';
import { OrbiProfileProvider } from './components/OrbiProfileContext';

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
      <OrbiProfileProvider>
        <RewardProvider>
          <RouterProvider router={router} />
        </RewardProvider>
      </OrbiProfileProvider>
    </ThemeProvider>
  );
}