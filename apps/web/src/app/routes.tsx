import { createBrowserRouter, Navigate } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { AgentPage } from './pages/AgentPage';
import { FocusPage } from './pages/FocusPage';
import { CalendarPage } from './pages/CalendarPage';
import { RemindersPage } from './pages/RemindersPage';
import { PricingPage } from './pages/PricingPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  {
    path: '/',
    Component: AppLayout,
    children: [
      { path: 'onboarding', Component: OnboardingPage },
      { path: 'dashboard', Component: DashboardPage },
      { path: 'tasks', Component: TasksPage },
      { path: 'agent', Component: AgentPage },
      { path: 'focus', Component: FocusPage },
      { path: 'calendar', Component: CalendarPage },
      { path: 'reminders', Component: RemindersPage },
      { path: 'pricing', Component: PricingPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);