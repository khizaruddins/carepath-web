'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useBlockDoctor } from '@/lib/hooks/use-doctor-discovery';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export interface BlockDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  onSuccess?: () => void;
}

export function BlockDoctorModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  onSuccess,
}: BlockDoctorModalProps) {
  const [reason, setReason] = useState('');
  const blockMutation = useBlockDoctor();

  const handleBlock = async () => {
    try {
      await blockMutation.mutateAsync({
        doctorId,
        payload: {
          reason: reason.trim() || undefined,
        },
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Block ${doctorName}?`}
      description="Prevent this doctor from contacting you or requesting access."
      maxWidth="md"
    >
      <div className="space-y-4 text-left">
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-rose-950">
              Block Connection
            </h4>
            <p className="text-rose-900/80 leading-relaxed">
              Blocking {doctorName} prevents new connection requests and stops access inquiries. You can unblock this doctor later from your relationship settings if needed.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Reason (Optional)
          </label>
          <textarea
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide context for blocking..."
            className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            maxLength={500}
          />
        </div>

        {blockMutation.isError && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              {blockMutation.error instanceof Error
                ? blockMutation.error.message
                : 'Failed to block doctor.'}
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-rose-200 text-rose-700 hover:bg-rose-50"
            isLoading={blockMutation.isPending}
            onClick={handleBlock}
          >
            Block Doctor
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
