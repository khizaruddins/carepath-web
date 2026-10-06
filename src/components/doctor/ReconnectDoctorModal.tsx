'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useReconnectDoctor } from '@/lib/hooks/use-doctor-discovery';
import { RotateCcw, CheckCircle2, History, ShieldAlert } from 'lucide-react';

export interface ReconnectDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  onSuccess?: () => void;
}

export function ReconnectDoctorModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  onSuccess,
}: ReconnectDoctorModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const reconnectMutation = useReconnectDoctor();

  const handleReconnect = async () => {
    try {
      await reconnectMutation.mutateAsync(doctorId);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? 'Reconnected' : `Reconnect with ${doctorName}`}
      description={
        isSuccess
          ? 'Active relationship restored.'
          : 'Restore an active care connection with your previous physician.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="space-y-4 py-2 text-left">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950">
                You&apos;re reconnected with {doctorName}.
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Your connection is active again. Your previous consultations, reports and relationship history remain available.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
            <History className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900">
                History Preserved
              </h4>
              <p className="leading-relaxed">
                Your previous relationship history, past consultations, and clinical interactions with {doctorName} remain securely linked and preserved.
              </p>
            </div>
          </div>

          {reconnectMutation.isError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                {reconnectMutation.error instanceof Error
                  ? reconnectMutation.error.message
                  : 'Failed to reconnect with doctor.'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={reconnectMutation.isPending}
              onClick={handleReconnect}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reconnect with Doctor
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
