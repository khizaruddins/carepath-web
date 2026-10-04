'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { ShieldAlert, X } from 'lucide-react';

interface DeclineConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  requesterName: string;
}

const COMMON_REASONS = [
  'Prefer to share records in person during consultation',
  'Consultation or second opinion no longer needed',
  'Prefer not to share these specific categories of records',
  'Requested access duration is longer than necessary',
];

export function DeclineConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  requesterName,
}: DeclineConfirmModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setSelectedReason('');
    setCustomReason('');
    setError(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleDecline = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const finalReason =
        selectedReason === 'OTHER'
          ? customReason.trim()
          : selectedReason || customReason.trim() || undefined;

      await onConfirm(finalReason);
      handleClose();
    } catch (err: any) {
      setError(err.message || 'Failed to decline request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Decline Access Request"
      description="You have full control over who accesses your medical records."
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        {error && (
          <ErrorMessage
            title="Action failed"
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          You are declining <strong>{requesterName}</strong>&apos;s request to access your medical records.
          The clinician will be notified that access was not granted. You can always grant access later if needed.
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Reason for declining (Optional)
          </label>
          <div className="space-y-2">
            {COMMON_REASONS.map((reason) => (
              <label
                key={reason}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                  selectedReason === reason
                    ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="declineReason"
                  value={reason}
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="mt-0.5 text-teal-800 focus:ring-teal-700"
                />
                <span>{reason}</span>
              </label>
            ))}

            <label
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                selectedReason === 'OTHER'
                  ? 'border-teal-700 bg-teal-50/50 text-slate-900 font-medium'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="declineReason"
                value="OTHER"
                checked={selectedReason === 'OTHER'}
                onChange={() => setSelectedReason('OTHER')}
                className="mt-0.5 text-teal-800 focus:ring-teal-700"
              />
              <span>Other clinical or personal reason</span>
            </label>
          </div>
        </div>

        {selectedReason === 'OTHER' && (
          <div>
            <textarea
              rows={2}
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Provide brief context for the clinician..."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
              maxLength={250}
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={isSubmitting}>
            Keep Request
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDecline}
            isLoading={isSubmitting}
            leftIcon={<X className="h-3.5 w-3.5" />}
          >
            Decline Request
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
