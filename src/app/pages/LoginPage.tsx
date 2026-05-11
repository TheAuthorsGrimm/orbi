import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Button, InputField, AstraLogo } from '@figma/astraui';
import { Sparkles } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigate('/dashboard');
  };

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
          <div className="flex flex-col gap-xs">
            <h1 className="text-heading text-text-primary">Welcome back</h1>
            <p className="text-label-sm text-text-secondary">
              Sign in to your Orbi workspace
            </p>
          </div>

          <div className="flex flex-col gap-lg">
            <InputField
              label="Email address"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={setEmail}
            />
            <InputField
              label="Password"
              type="password"
              value={password}
              placeholder="Your password"
              onChange={setPassword}
            />
          </div>

          <div className="flex justify-end">
            <button className="text-label-sm text-brand-primary hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer">
              Forgot password?
            </button>
          </div>

          <Button variant="primary" onClick={handleLogin} className="w-full">
            Sign in
          </Button>

          <p className="text-label-sm text-text-secondary text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-primary hover:opacity-80">
              Create one
            </Link>
          </p>
        </div>

        {/* Tagline */}
        <p className="text-video-title text-text-tertiary text-center italic">
          Built for the ADHD brain. Not around it.
        </p>
      </div>
    </div>
  );
}
