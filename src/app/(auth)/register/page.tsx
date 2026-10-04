'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'ADMIN'>('PATIENT');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        fullName,
        email,
        password,
        phoneNumber: phoneNumber || undefined,
        role,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create your Health Vault</h2>
        <p className="text-xs text-slate-500 mt-1">
          Establish your private repository for medical records and history.
        </p>
      </div>

      {error && (
        <ErrorMessage
          title="Registration error"
          message={error}
          onRetry={() => setError(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Legal Name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Alex Morgan"
        />

        <Input
          label="Email Address"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="alex@carepath.example.com"
        />

        <Input
          label="Password (min. 8 characters)"
          type="password"
          autoComplete="new-password"
          required
          showPasswordToggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
        />

        <Input
          label="Mobile Phone (Optional)"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+1 (555) 000-0000"
          helperText="Used for upcoming two-factor security and verification"
        />

        <Select
          label="Account Role"
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          options={[
            { label: 'Patient (Personal Health Vault)', value: 'PATIENT' },
            { label: 'Doctor / Clinician (Care Team)', value: 'DOCTOR' },
            { label: 'Administrator', value: 'ADMIN' },
          ]}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Create Vault Account
          </Button>
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="text-xs text-slate-600">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-teal-800 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
