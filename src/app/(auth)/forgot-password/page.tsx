'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await authApi.forgotPassword(email);
      setSubmitted(true);
      if (response.resetToken) {
        setResetToken(response.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Could not dispatch password reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset Your Password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-6 text-center space-y-3 rounded-lg bg-teal-50 border border-teal-200">
            <CheckCircle2 className="h-9 w-9 text-teal-700 mx-auto" />
            <h3 className="text-sm font-semibold text-teal-900">Reset Link Dispatched</h3>
            <p className="text-xs text-teal-800 leading-relaxed">
              If an account is associated with <strong>{email}</strong>, a secure reset token has
              been dispatched.
            </p>
          </div>

          {resetToken && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
              <span className="font-semibold text-slate-800 block mb-1">
                Development Test Reset Token:
              </span>
              <code className="bg-white p-1 rounded border border-slate-200 text-[11px] block break-all">
                {resetToken}
              </code>
              <Link
                href={`/reset-password?token=${resetToken}`}
                className="mt-2 inline-block text-teal-800 font-semibold hover:underline"
              >
                Proceed to Reset Password →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <>
          {error && (
            <ErrorMessage
              title="Request failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@carepath.example.com"
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Send Reset Instructions
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
