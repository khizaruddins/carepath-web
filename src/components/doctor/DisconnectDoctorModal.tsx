'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useDisconnectDoctor } from '@/lib/hooks/use-doctor-discovery';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export interface DisconnectDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  onSuccess?: () => void;
}

export function DisconnectDoctorModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  onSuccess,
}: DisconnectDoctorModalProps) {
  const [reason, setReason] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const disconnectMutation = useDisconnectDoctor();

  const handleDisconnect = async () => {
    try {
      await disconnectMutation.mutateAsync({
        doctorId,
        payload: {
          reason: reason.trim() || undefined,
        },
      });
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setReason('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? 'Relationship Ended' : `End relationship with ${doctorName}?`}
      description={
        isSuccess
          ? 'The relationship is now inactive.'
          : 'Update your CarePath active care network.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="space-y-4 py-2 text-left">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">
                Active connection ended.
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can reconnect with {doctorName} anytime from your Previous Doctors list. All historical records remain intact.
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
          {/* Explicit Historical Guarantee Callout */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-amber-950">
                Clinical History Is Preserved
              </h4>
              <p className="text-amber-900/80 leading-relaxed">
                This ends your active relationship with this doctor. <strong>Your previous consultations, reports and relationship history are not deleted.</strong>
              </p>
              <p className="text-amber-800/80 text-[11px] mt-1">
                You can view historical timeline notes anytime or reconnect in the future.
              </p>
            </div>
          </div>

          {/* Optional reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reason for Ending Relationship (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Treatment completed, relocated, consulting another specialist..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              maxLength={500}
            />
          </div>

          {disconnectMutation.isError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                {disconnectMutation.error instanceof Error
                  ? disconnectMutation.error.message
                  : 'Failed to end relationship. Please try again.'}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              isLoading={disconnectMutation.isPending}
              onClick={handleDisconnect}
            >
              End Relationship
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
