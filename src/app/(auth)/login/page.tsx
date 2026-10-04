'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password123!');
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to your Health Vault</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your credentials to access your private medical records.
        </p>
      </div>

      {error && (
        <ErrorMessage
          title="Sign in failed"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="patient@carepath.example.com"
        />

        <div>
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            showPasswordToggle
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-teal-800 hover:text-teal-900 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          className="w-full"
          rightIcon={<ArrowRight className="h-4 w-4" />}
        >
          Access Health Vault
        </Button>
      </form>

      {/* Demo Credentials Helper */}
      <div className="pt-4 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 text-teal-700" />
          <span>Quick Demo Accounts (Password: Password123!)</span>
        </p>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleFillDemo('patient@carepath.example.com')}
            className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Patient: Alex Morgan
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('doctor@carepath.example.com')}
            className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Doctor: Dr. Jenkins
          </button>
          <button
            type="button"
            onClick={() => handleFillDemo('admin@carepath.example.com')}
            className="text-[11px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            Admin Account
          </button>
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-600">
          Don&apos;t have a health vault yet?{' '}
          <Link href="/register" className="font-semibold text-teal-800 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
