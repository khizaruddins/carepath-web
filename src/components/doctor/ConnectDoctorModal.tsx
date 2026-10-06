'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { useConnectDoctor } from '@/lib/hooks/use-doctor-discovery';
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
} from 'lucide-react';
import Link from 'next/link';

export interface ConnectDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: string;
  doctorName: string;
  specialization?: string | null;
  onSuccess?: () => void;
}

export function ConnectDoctorModal({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  specialization,
  onSuccess,
}: ConnectDoctorModalProps) {
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const connectMutation = useConnectDoctor();

  const handleConnect = async () => {
    try {
      await connectMutation.mutateAsync({
        doctorId,
        payload: {
          source: 'SEARCH',
          notes: notes.trim() || undefined,
        },
      });
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Error is captured by mutation
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setNotes('');
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isSuccess ? 'Connection Established' : `Connect with ${doctorName}`}
      description={
        isSuccess
          ? 'Your professional care relationship is now active.'
          : 'Establish a direct care relationship on CarePath.'
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="space-y-4 py-2 text-left">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950">
                You&apos;re now connected with {doctorName}.
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                This doctor is now part of your CarePath network.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-slate-800 text-xs font-semibold">
              <Lock className="h-4 w-4 text-teal-700" />
              <span>Independent Record Access Control</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record access is controlled separately through CarePath consent. Connecting does not give the doctor automatic access to your diagnostic vault or private timeline events.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="primary" onClick={handleClose}>
              Done
            </Button>
            <Link href={`/app/doctors/${doctorId}`}>
              <Button
                variant="outline"
                onClick={handleClose}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View Doctor Profile
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-left">
          {/* Key Architectural Disclaimer */}
          <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-teal-950">
                How CarePath Connections Work
              </h4>
              <p className="text-teal-900/80 leading-relaxed">
                Connecting allows you to establish a CarePath relationship with this doctor. <strong>It does not automatically give the doctor access to your medical records.</strong>
              </p>
              <p className="text-teal-800/80 text-[11px] mt-1">
                When you need to share specific diagnostic reports or consultations, you grant purpose-bound consent separately.
              </p>
            </div>
          </div>

          {/* Optional Relationship Context / Reason */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Reason or Note for Connection (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Recommended by family physician, seeking second opinion on test results..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              maxLength={500}
            />
            <span className="text-[10px] text-slate-400 block text-right">
              {notes.length}/500 characters
            </span>
          </div>

          {connectMutation.isError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
              <span>
                {connectMutation.error instanceof Error
                  ? connectMutation.error.message
                  : 'Failed to establish relationship. Please try again.'}
              </span>
            </div>
          )}

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={connectMutation.isPending}
              onClick={handleConnect}
              leftIcon={<UserCheck className="h-3.5 w-3.5" />}
            >
              Connect with Doctor
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
