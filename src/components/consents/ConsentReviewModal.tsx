'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Consent } from '@/lib/api/types';
import {
  formatConsentPurpose,
  formatResourceCategory,
  formatResourceType,
} from '@/lib/consent-utils';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  CheckCircle2,
  X,
  Stethoscope,
  Calendar,
  Eye,
  Download,
  Info,
} from 'lucide-react';
import { DeclineConfirmModal } from './DeclineConfirmModal';

interface ConsentReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: Consent | null;
  onApprove: (id: string) => Promise<void>;
  onDecline: (id: string, reason?: string) => Promise<void>;
}

export function ConsentReviewModal({
  isOpen,
  onClose,
  consent,
  onApprove,
  onDecline,
}: ConsentReviewModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  if (!consent) return null;

  const doctorProfile = consent.requester?.doctorProfile;
  const doctorName = doctorProfile?.fullName || 'Physician';
  const specialization = doctorProfile?.specialization || 'Healthcare Provider';
  const hospital = doctorProfile?.hospitalAffiliation || doctorProfile?.clinicName;

  const handleApprove = async () => {
    setError(null);
    setIsApproving(true);
    try {
      await onApprove(consent.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to approve consent request.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleDeclineConfirm = async (reason?: string) => {
    await onDecline(consent.id, reason);
    setShowDeclineModal(false);
    onClose();
  };

  return (
    <>
      <Dialog
        isOpen={isOpen && !showDeclineModal}
        onClose={onClose}
        title="Review Access Request"
        description="Verify physician details, requested records, and access duration before granting permission."
        maxWidth="lg"
      >
        <div className="space-y-5 text-left">
          {error && (
            <ErrorMessage
              title="Authorization failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          {/* WHO: Doctor Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{doctorName}</h4>
                  <Badge variant="success" size="sm" dot>
                    Verified Clinician
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 font-medium">{specialization}</p>
                {hospital && (
                  <p className="text-[11px] text-slate-500">
                    {hospital} {doctorProfile?.city ? `• ${doctorProfile.city}` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                Requested On
              </span>
              <span className="text-xs text-slate-600 font-medium">
                {formatDate(consent.requestedAt)}
              </span>
            </div>
          </div>

          {/* WHY: Purpose & Clinical Rationale */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Info className="h-3.5 w-3.5 text-teal-700" />
              <span>Clinical Purpose & Rationale</span>
            </div>
            <div className="p-3.5 rounded-lg bg-teal-50/40 border border-teal-100 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-teal-900 uppercase tracking-wide">
                  Purpose:
                </span>
                <span className="text-xs font-medium text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                  {formatConsentPurpose(consent.purpose)}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-2.5 rounded border border-teal-100/60">
                &ldquo;{consent.purposeDescription}&rdquo;
              </p>
            </div>
          </div>

          {/* WHAT: Scopes & Access Level */}
          <div className="space-y-2">
            <h5 className="text-xs font-semibold text-slate-700">
              Requested Records & Permissions ({consent.scopes.length})
            </h5>
            <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
              {consent.scopes.map((scope, idx) => (
                <div
                  key={scope.id || idx}
                  className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50/60"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800">
                      {formatResourceType(scope.resourceType)}
                    </span>
                    <span className="text-slate-500 ml-2">
                      ({formatResourceCategory(scope.resourceCategory)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    {scope.accessLevel === 'DOWNLOAD' ? (
                      <>
                        <Download className="h-3 w-3 text-slate-500" />
                        <span>View & Download</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 text-slate-500" />
                        <span>View Only</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UNTIL WHEN: Expiration */}
          <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/80 flex items-center gap-3 text-xs text-amber-900">
            <Calendar className="h-4 w-4 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Access Expiration: </span>
              <span>Valid until {formatDate(consent.expiresAt)}</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Access automatically revokes after this timestamp. You can also revoke access anytime earlier.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeclineModal(true)}
              disabled={isApproving}
              leftIcon={<X className="h-3.5 w-3.5 text-rose-600" />}
            >
              Decline Request
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={onClose} disabled={isApproving}>
                Review Later
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                isLoading={isApproving}
                leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
              >
                Approve Access
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {showDeclineModal && (
        <DeclineConfirmModal
          isOpen={showDeclineModal}
          onClose={() => setShowDeclineModal(false)}
          onConfirm={handleDeclineConfirm}
          requesterName={doctorName}
        />
      )}
    </>
  );
}
