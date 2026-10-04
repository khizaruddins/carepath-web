'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ShieldAlert, Lock } from 'lucide-react';

interface RevokeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  requesterName: string;
}

export function RevokeConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  requesterName,
}: RevokeConfirmModalProps) {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setReason('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleRevoke = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await onConfirm(reason.trim() || undefined);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to revoke access. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Revoke Record Access"
      description="Immediately terminate physician access to your private medical records."
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {error && (
          <ErrorMessage
            title="Revocation failed"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-rose-950">
            <ShieldAlert className="h-4 w-4 text-rose-700" />
            Immediate Effect
          </div>
          <p className="leading-relaxed">
            Revoking access takes effect immediately. <strong>{requesterName}</strong> will no longer be able to view or download any documents covered by this consent.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reason for revocation (Optional)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Consultation completed, second opinion finished, switching care team..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            maxLength={250}
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Keep Access Active
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleRevoke}
            isLoading={isSubmitting}
            leftIcon={<Lock className="h-3.5 w-3.5" />}
          >
            Revoke Access Immediately
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
