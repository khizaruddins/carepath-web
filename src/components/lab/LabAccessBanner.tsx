'use client';

import React from 'react';
import { LabCareConnection } from '@/lib/api/types';
import { Badge } from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { Lock, Clock, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface LabAccessBannerProps {
  connection?: LabCareConnection | Partial<LabCareConnection> | null;
  className?: string;
}

export function LabAccessBanner({ connection, className = '' }: LabAccessBannerProps) {
  if (!connection || !connection.status) return null;

  const isActive = connection.status === 'ACTIVE';
  const isAutoRevoked = connection.status === 'AUTO_REVOKED';
  const isManualRevoked = connection.status === 'MANUAL_REVOKED';
  const isExpired = connection.status === 'EXPIRED';

  if (isActive) {
    return (
      <div
        className={`p-4 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${className}`}
      >
        <div className="flex items-start gap-2.5">
          <Lock className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-teal-900 text-sm">
                Temporary Clinical Connection Active
              </span>
              <Badge variant="success" size="sm" dot>
                72h Authorized Window
              </Badge>
            </div>
            <p className="text-teal-800 text-[11px] mt-0.5">
              Access is limited to minimum-necessary clinical context required for sample analysis.
              This access will <strong>automatically terminate</strong> when the final report is published to the patient&apos;s vault.
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-teal-800/80 block">
            Access Expiration
          </span>
          <span className="font-semibold text-teal-900 flex items-center sm:justify-end gap-1 text-xs">
            <Clock className="h-3.5 w-3.5 text-teal-700" />
            {connection.expiresAt ? formatDateTime(connection.expiresAt) : '72 Hours Authorized Window'}
          </span>
        </div>
      </div>
    );
  }

  if (isAutoRevoked) {
    return (
      <div
        className={`p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-3 text-xs ${className}`}
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        <div>
          <span className="font-semibold text-slate-900">
            Clinical Connection Completed &amp; Auto-Revoked
          </span>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Diagnostic report has been delivered to patient vault. Clinical access has been revoked according to data minimization principles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3 text-xs ${className}`}
    >
      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
      <div>
        <span className="font-semibold text-amber-950">
          Temporary Clinical Access Inactive ({connection.status.replace('_', ' ')})
        </span>
        <p className="text-amber-800 text-[11px] mt-0.5">
          {isManualRevoked
            ? 'The patient has revoked laboratory access to this clinical order.'
            : 'The 72-hour temporary clinical access window has expired.'}
        </p>
      </div>
    </div>
  );
}
