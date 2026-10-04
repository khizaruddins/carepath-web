'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { Shield, Key, Lock, LogOut, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account & Vault Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your account credentials, security preferences, and active sessions.
        </p>
      </div>

      <div className="space-y-6">
        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Account Identity & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Email Address:</span>
              <span className="font-semibold text-slate-900">{user?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account Role:</span>
              <Badge variant="brand" size="sm">
                {user?.role || 'PATIENT'}
              </Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Account State:</span>
              <Badge variant="success" size="sm" dot>
                {user?.status || 'ACTIVE'}
              </Badge>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Email Verification:</span>
              <span className="font-medium text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Security & Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Security & Password Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Password</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Secured with bcrypt password hashing (12 rounds).
                </p>
              </div>
              <Link href="/forgot-password">
                <Button variant="outline" size="sm" leftIcon={<Key className="h-3.5 w-3.5" />}>
                  Reset Password
                </Button>
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Storage Protection</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Private S3-compatible medical vault. Ephemeral signed tokens (15m expiry).
                </p>
              </div>
              <Badge variant="neutral" size="sm">
                Private Bucket
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-600 leading-relaxed">
              You are currently authenticated on this device. Logging out will revoke your active
              refresh token and terminate the session.
            </p>

            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              leftIcon={<LogOut className="h-3.5 w-3.5" />}
            >
              Sign Out of All Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
