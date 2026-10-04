'use client';

import React, { useState } from 'react';
import { LabCareConnection } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Building2,
  FileText,
} from 'lucide-react';
import { useRevokeConnectionMutation } from '@/lib/hooks/use-lab-marketplace';

interface TemporaryClinicalAccessCardProps {
  connection: LabCareConnection;
  onRevoked?: () => void;
  className?: string;
}

export function TemporaryClinicalAccessCard({
  connection,
  onRevoked,
  className = '',
}: TemporaryClinicalAccessCardProps) {
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');

  const revokeMutation = useRevokeConnectionMutation(connection.id);

  const isActive = connection.status === 'ACTIVE';
  const isExpired = connection.status === 'EXPIRED';
  const isRevoked = connection.status === 'AUTO_REVOKED' || connection.status === 'MANUAL_REVOKED';

  const handleRevoke = async () => {
    try {
      await revokeMutation.mutateAsync(revokeReason || undefined);
      setIsRevokeDialogOpen(false);
      onRevoked?.();
    } catch (err) {
      console.error('Failed to revoke temporary access', err);
    }
  };

  const getStatusBadge = () => {
    switch (connection.status) {
      case 'ACTIVE':
        return (
          <Badge variant="success" size="sm" dot>
            Active Temporary Access
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="neutral" size="sm">
            Access Expired
          </Badge>
        );
      case 'AUTO_REVOKED':
        return (
          <Badge variant="neutral" size="sm">
            Auto-Revoked on Report Delivery
          </Badge>
        );
      case 'MANUAL_REVOKED':
        return (
          <Badge variant="error" size="sm">
            Manually Revoked by Patient
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {connection.status}
          </Badge>
        );
    }
  };

  return (
    <>
      <Card className={`border-slate-200 shadow-sm ${className}`}>
        <CardHeader className="py-3 px-5 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-teal-700" />
            <CardTitle className="text-sm font-semibold text-slate-900">
              Temporary Clinical Connection
            </CardTitle>
          </div>
          {getStatusBadge()}
        </CardHeader>

        <CardContent className="p-5 space-y-4 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Authorized Laboratory
              </span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-4 w-4 text-teal-700" />
                {connection.lab?.name || 'Authorized Diagnostic Center'}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                Expiration Window
              </span>
              <span className="text-slate-700 font-medium flex items-center sm:justify-end gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {isActive ? (
                  <>Expires {formatDateTime(connection.expiresAt)}</>
                ) : (
                  <>Ended {formatDateTime(connection.revokedAt || connection.expiresAt)}</>
                )}
              </span>
            </div>
          </div>

          {/* Scopes Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Allowed Scope */}
            <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-900 font-semibold mb-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Permitted Scopes (Minimum-Necessary)</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>Patient Name, Age & Biological Sex</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>Prescribed test specifications & sample types</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>Doctor&apos;s clinical reason & fasting/prep instructions</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-700 font-bold">•</span>
                  <span>Direct upload authorization for final report</span>
                </li>
              </ul>
            </div>

            {/* Restricted Scope */}
            <div className="p-3 bg-rose-50/70 rounded-lg border border-rose-200">
              <div className="flex items-center gap-1.5 text-rose-900 font-semibold mb-2">
                <XCircle className="h-4 w-4 text-rose-700 shrink-0" />
                <span>Strictly Denied & Vault-Isolated</span>
              </div>
              <ul className="space-y-1 text-slate-700 text-[11px]">
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-700 font-bold">•</span>
                  <span>Full Patient Health Vault & Past Documents</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-700 font-bold">•</span>
                  <span>Longitudinal Medical Timeline & Consultations</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-700 font-bold">•</span>
                  <span>Prescription history & unconnected diagnoses</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-rose-700 font-bold">•</span>
                  <span>Permanent data retention or external data sharing</span>
                </li>
              </ul>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong>CarePath Privacy Guarantee:</strong> Access is purpose-bound to fulfilling this investigation request. When the laboratory issues your finalized report to your secure vault, this connection automatically revokes immediately.
          </p>

          {isActive && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevokeDialogOpen(true)}
                className="text-rose-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                leftIcon={<ShieldAlert className="h-3.5 w-3.5" />}
              >
                Revoke Access Early
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Revocation Confirmation Dialog */}
      <Dialog
        isOpen={isRevokeDialogOpen}
        onClose={() => setIsRevokeDialogOpen(false)}
        title="Revoke Laboratory Access"
        description="Are you sure you want to terminate this laboratory's temporary clinical access?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-left">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Revoking access will immediately disable the laboratory&apos;s ability to view your order details or submit test reports electronically through CarePath.
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Reason for Revocation (Optional)
            </label>
            <input
              type="text"
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              placeholder="e.g. Canceling test, choosing different center"
              className="w-full text-xs p-2 rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRevokeDialogOpen(false)}
            >
              Keep Active
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={revokeMutation.isPending}
              onClick={handleRevoke}
            >
              Confirm Revocation
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
