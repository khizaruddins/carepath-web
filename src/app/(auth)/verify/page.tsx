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

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
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
    setIsLoading(true);

    try {
      await authApi.verifyEmail(token);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification token.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verify Your Email</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter the verification token sent to your email address to activate all account features.
        </p>
      </div>

      {success ? (
        <div className="p-6 text-center space-y-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
          <h3 className="text-base font-semibold text-emerald-900">Email Verified Successfully</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Your CarePath account is now fully verified and active.
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
              title="Verification failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Verification Token"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="e.g. 32-character token"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Verify Email Address
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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 flex justify-center">
          <LoadingSpinner size="md" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
