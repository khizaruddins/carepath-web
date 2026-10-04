'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { CheckCircle2, ArrowRight } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    if (t) setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired password reset token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your reset token and choose a new secure password.
        </p>
      </div>

      {success ? (
        <div className="p-6 text-center space-y-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-semibold text-emerald-900">Password Updated Successfully</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">
            All previous sessions have been securely terminated. You can now sign in with your new
            password.
          </p>
          <Link href="/login" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Sign In to Your Vault
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <ErrorMessage
              title="Reset failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Reset Token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your 32-character reset token"
            />

            <Input
              label="New Password"
              type="password"
              required
              showPasswordToggle
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              showPasswordToggle
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Update Password
            </Button>
          </form>
        </>
      )}

      <div className="text-center pt-2">
        <Link href="/login" className="text-xs text-slate-500 hover:text-slate-800">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
