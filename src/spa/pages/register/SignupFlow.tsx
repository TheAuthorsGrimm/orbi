import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/spa/context/AuthContext';
import { useOrbiProfile } from '../../OrbiProfileContext';
import type { SignupData, TierId, TourChoice } from './types';

// Steps
import { WelcomeStep } from './steps/WelcomeStep';
import { NameStep } from './steps/NameStep';
import { ContactStep } from './steps/ContactStep';
import { PasswordStep } from './steps/PasswordStep';
import { TierStep } from './steps/TierStep';
import { PaymentStep } from './steps/PaymentStep';
import { FinalizeStep } from './steps/FinalizeStep';
import { TourStep } from './steps/TourStep';

/**
 * Multi-step signup flow.
 * Steps: Welcome → Name → Contact → Password → Tier → (Payment) → Finalize → Tour
 * The Payment step is shown only when a paid tier is selected.
 * Total visual dots adjust dynamically.
 */
export function SignupFlow() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { updateProfile, markOnboarded } = useOrbiProfile();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    selectedTier: 'free',
  });

  const isPaid = data.selectedTier !== 'free';
  // Steps: 0=Welcome, 1=Name, 2=Contact, 3=Password, 4=Tier, (5=Payment if paid), 6=Finalize, 7=Tour
  const totalSteps = isPaid ? 8 : 7;

  function update<K extends keyof SignupData>(key: K, value: SignupData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setError(null);
  }

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const displayName = `${data.firstName} ${data.lastName}`.trim();
      await register(data.email.trim(), data.password, displayName);

      // Persist profile details
      updateProfile({
        preferredName: data.firstName.trim(),
      });

      next(); // → Tour step
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  function handleTourChoice(choice: TourChoice) {
    markOnboarded();
    // For now all choices go to dashboard; tour system can intercept later
    if (choice === 'self-explore') {
      navigate('/dashboard', { replace: true });
    } else {
      // Quick and full tour will be handled by a future tour system
      navigate('/dashboard', { replace: true });
    }
  }

  // Resolve the logical step accounting for the conditional payment page
  function renderStep() {
    // Steps without payment: 0..6 map to Welcome, Name, Contact, Password, Tier, Finalize, Tour
    // Steps with payment:    0..7 map to Welcome, Name, Contact, Password, Tier, Payment, Finalize, Tour
    if (step === 0) {
      return <WelcomeStep onNext={next} />;
    }
    if (step === 1) {
      return (
        <NameStep
          firstName={data.firstName}
          lastName={data.lastName}
          onFirstNameChange={(v) => update('firstName', v)}
          onLastNameChange={(v) => update('lastName', v)}
          onNext={next}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }
    if (step === 2) {
      return (
        <ContactStep
          email={data.email}
          onEmailChange={(v) => update('email', v)}
          onNext={next}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }
    if (step === 3) {
      return (
        <PasswordStep
          password={data.password}
          onPasswordChange={(v) => update('password', v)}
          onNext={next}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }
    if (step === 4) {
      return (
        <TierStep
          selectedTier={data.selectedTier}
          onSelectTier={(t: TierId) => update('selectedTier', t)}
          onNext={next}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }
    if (isPaid && step === 5) {
      return (
        <PaymentStep
          selectedTier={data.selectedTier}
          onNext={next}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }

    const finalizeIdx = isPaid ? 6 : 5;
    const tourIdx = isPaid ? 7 : 6;

    if (step === finalizeIdx) {
      return (
        <FinalizeStep
          data={data}
          loading={loading}
          error={error}
          onSubmit={handleSubmit}
          onBack={back}
          totalSteps={totalSteps}
        />
      );
    }
    if (step === tourIdx) {
      return <TourStep firstName={data.firstName} onChoose={handleTourChoice} />;
    }

    return null;
  }

  return <>{renderStep()}</>;
}
