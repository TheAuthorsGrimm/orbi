import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import { useOrbiProfile } from '../OrbiProfileContext';
import { SignupFlow } from './register/SignupFlow';

export function RegisterPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { isOnboarded } = useOrbiProfile();

  // Redirect authenticated users away from the signup page
  useEffect(() => {
    if (!loading && user) {
      navigate(isOnboarded ? '/dashboard' : '/onboarding', { replace: true });
    }
  }, [loading, user, isOnboarded, navigate]);

  if (loading || user) return null;

  return <SignupFlow />;
}