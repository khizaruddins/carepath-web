'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useShareReportMutation } from '@/lib/hooks/use-lab-marketplace';
import { Stethoscope, Lock, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId: string;
  reportTitle?: string | null;
  prescribedDoctorId?: string | null;
  prescribedDoctorName?: string | null;
  onSuccess?: () => void;
}

export function ShareReportModal({
  isOpen,
  onClose,
  reportId,
  reportTitle,
  prescribedDoctorId,
  prescribedDoctorName,
  onSuccess,
}: ShareReportModalProps) {
  const [doctorId, setDoctorId] = useState(prescribedDoctorId || '');
  const [purpose, setPurpose] = useState('Diagnostic review and treatment plan evaluation');
  const [durationDays, setDurationDays] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const shareMutation = useShareReportMutation(reportId);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId.trim()) {
      setErrorMessage('Please specify the physician ID or select the prescribing doctor.');
      return;
    }
    setErrorMessage(null);

    try {
      await shareMutation.mutateAsync({
        doctorId: doctorId.trim(),
        purpose: purpose.trim() || undefined,
        durationDays,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authorize clinician access to report.');
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Share Diagnostic Report with Clinician"
      description="Authorize your physician to securely view this laboratory test report."
      maxWidth="sm"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">Report Successfully Shared</h4>
          <p className="text-xs text-slate-600">
            A scoped 30-day view-only consent record has been issued to your doctor.
          </p>
        </div>
      ) : (
        <form onSubmit={handleShare} className="space-y-4 text-xs text-left">
          {/* Document context */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Selected Report
            </span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {reportTitle || 'Diagnostic Laboratory Report'}
            </span>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Recipient Clinician
            </label>
            {prescribedDoctorName ? (
              <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-700" />
                  <span className="font-bold text-teal-900">
                    Dr. {prescribedDoctorName} (Prescribing Physician)
                  </span>
                </div>
                <Badge variant="brand" size="sm">
                  Prescriber
                </Badge>
              </div>
            ) : (
              <input
                type="text"
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                placeholder="Doctor ID or UUID"
                className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
              />
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Clinical Purpose of Sharing
            </label>
            <input
              type="text"
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Follow-up consultation on thyroid parameters"
              className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-slate-800 font-semibold mb-1">
              Access Duration
            </label>
            <select
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            >
              <option value={7}>7 Days (Short consultation)</option>
              <option value={30}>30 Days (Standard clinical review)</option>
              <option value={90}>90 Days (Ongoing chronic management)</option>
            </select>
          </div>

          {/* Privacy & View-Only Notice */}
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-950">
            <Lock className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Strict View-Only Policy:</strong> The physician will be able to review this report and provide clinical assessments in their workspace. They are strictly prohibited from exporting or downloading your original files.
            </p>
          </div>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={shareMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={shareMutation.isPending}
            >
              Grant View-Only Access
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
