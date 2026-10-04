'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { Consent } from '@/lib/api/types';
import { consentsApi } from '@/lib/api/consents';
import { ConsentBadge } from './ConsentBadge';
import {
  formatConsentPurpose,
  formatResourceCategory,
  formatResourceType,
  getExpiryRemainingText,
} from '@/lib/consent-utils';
import { formatDate } from '@/lib/utils';
import {
  Calendar,
  Eye,
  Download,
  FileText,
  Lock,
  Stethoscope,
  Info,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

interface ConsentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  consent: Consent | null;
  onRevoke?: (consent: Consent) => void;
  userRole?: 'PATIENT' | 'DOCTOR' | 'ADMIN';
}

export function ConsentDetailsModal({
  isOpen,
  onClose,
  consent,
  onRevoke,
  userRole = 'PATIENT',
}: ConsentDetailsModalProps) {
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['consent-resources', consent?.id],
    queryFn: () => consentsApi.getConsentResources(consent!.id),
    enabled: isOpen && !!consent && consent.status === 'APPROVED',
  });

  if (!consent) return null;

  const doctorProfile = consent.requester?.doctorProfile;
  const doctorName = doctorProfile?.fullName || 'Physician';
  const patientProfile = consent.patient?.patientProfile;
  const patientName = patientProfile?.fullName || consent.patient?.email || 'Patient';
  const expiry = getExpiryRemainingText(consent.expiresAt);

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Consent Grant Details"
      description="Cryptographically tracked authorization record with immutable audit trace."
      maxWidth="lg"
    >
      <div className="space-y-5 text-left">
        {/* Header Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {userRole === 'DOCTOR' ? patientName : doctorName}
                </h4>
                <ConsentBadge status={consent.status} />
              </div>
              <p className="text-xs text-slate-500">
                {userRole === 'DOCTOR'
                  ? `Patient Record • ${consent.patient?.email}`
                  : `${doctorProfile?.specialization || 'Clinician'} • ${doctorProfile?.hospitalAffiliation || doctorProfile?.clinicName || 'CarePath Verified'}`}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span
              className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${expiry.badgeClass}`}
            >
              {expiry.text}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Until {formatDate(consent.expiresAt)}
            </span>
          </div>
        </div>

        {/* Clinical Rationale & Purpose */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-teal-700" />
            Clinical Purpose & Justification
          </h5>
          <div className="p-3.5 rounded-lg bg-teal-50/40 border border-teal-100 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-teal-900">Objective:</span>
              <span className="bg-teal-100/70 text-teal-800 px-2 py-0.5 rounded font-medium">
                {formatConsentPurpose(consent.purpose)}
              </span>
            </div>
            <p className="italic bg-white/70 p-2.5 rounded border border-teal-100/60 leading-relaxed">
              &ldquo;{consent.purposeDescription}&rdquo;
            </p>
          </div>
        </div>

        {/* Authorization Scope List */}
        <div className="space-y-1.5">
          <h5 className="text-xs font-semibold text-slate-700">
            Authorized Resource Scopes ({consent.scopes.length})
          </h5>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
            {consent.scopes.map((scope, idx) => (
              <div
                key={scope.id || idx}
                className="p-2.5 flex items-center justify-between text-xs"
              >
                <div>
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

        {/* Resolved Documents (if APPROVED) */}
        {consent.status === 'APPROVED' && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-700" />
              Resolved Accessible Documents
            </h5>
            {isLoadingResources ? (
              <div className="py-4">
                <LoadingSpinner message="Checking accessible vault documents..." />
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-40 overflow-y-auto">
                {resources.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-teal-600 shrink-0" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {doc.metadata?.reportTitle || doc.category.replace(/_/g, ' ')}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {doc.metadata?.providerName || 'Uploaded Record'} • {formatDate(doc.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/app/documents/${doc.id}`}
                      className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
                    >
                      View Record
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg border border-slate-100">
                No matching documents currently uploaded in the patient vault under these categories.
              </p>
            )}
          </div>
        )}

        {/* Timeline / Audit Trail */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between">
            <span>Requested:</span>
            <span className="font-medium text-slate-800">{formatDate(consent.requestedAt)}</span>
          </div>
          {consent.approvedAt && (
            <div className="flex items-center justify-between">
              <span>Approved by Patient:</span>
              <span className="font-medium text-emerald-700">{formatDate(consent.approvedAt)}</span>
            </div>
          )}
          {consent.declinedAt && (
            <div className="flex items-center justify-between">
              <span>Declined by Patient:</span>
              <span className="font-medium text-slate-700">{formatDate(consent.declinedAt)}</span>
            </div>
          )}
          {consent.revokedAt && (
            <div className="flex items-center justify-between">
              <span>Revoked by Patient:</span>
              <span className="font-medium text-rose-700">{formatDate(consent.revokedAt)}</span>
            </div>
          )}
          {consent.revokeReason && (
            <p className="text-slate-500 italic pt-1 border-t border-slate-200">
              Revocation Note: &ldquo;{consent.revokeReason}&rdquo;
            </p>
          )}
          {consent.declineReason && (
            <p className="text-slate-500 italic pt-1 border-t border-slate-200">
              Decline Note: &ldquo;{consent.declineReason}&rdquo;
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {userRole === 'PATIENT' && consent.status === 'APPROVED' && onRevoke && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onClose();
                  onRevoke(consent);
                }}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
              >
                Revoke Access
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
