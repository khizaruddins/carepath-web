'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Consent } from '@/lib/api/types';
import { ConsentBadge } from './ConsentBadge';
import {
  formatConsentPurpose,
  formatResourceCategory,
  formatResourceType,
  getExpiryRemainingText,
} from '@/lib/consent-utils';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  Clock,
  Calendar,
  Eye,
  Download,
  CheckCircle2,
  X,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  User,
} from 'lucide-react';

interface ConsentCardProps {
  consent: Consent;
  viewerRole: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  onReview?: (consent: Consent) => void;
  onApprove?: (consent: Consent) => void;
  onDecline?: (consent: Consent) => void;
  onRevoke?: (consent: Consent) => void;
  onCancel?: (consent: Consent) => void;
  onViewDetails?: (consent: Consent) => void;
}

export function ConsentCard({
  consent,
  viewerRole,
  onReview,
  onApprove,
  onDecline,
  onRevoke,
  onCancel,
  onViewDetails,
}: ConsentCardProps) {
  const isPatient = viewerRole === 'PATIENT';
  const doctorProfile = consent.requester?.doctorProfile;
  const doctorName = doctorProfile?.fullName || 'Physician';
  const patientProfile = consent.patient?.patientProfile;
  const patientName = patientProfile?.fullName || consent.patient?.email || 'Patient';

  const expiry = getExpiryRemainingText(consent.expiresAt);
  const hasDownloadAccess = consent.scopes.some((s) => s.accessLevel === 'DOWNLOAD');

  // Scope summary text
  const categories = Array.from(
    new Set(consent.scopes.map((s) => formatResourceCategory(s.resourceCategory))),
  );
  const scopeSummary = categories.slice(0, 3).join(', ') + (categories.length > 3 ? ` +${categories.length - 3} more` : '');

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <div className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 text-left">
        {/* Left Column: Requester/Patient Details & Request Info */}
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
              {isPatient ? <Stethoscope className="h-5 w-5" /> : <User className="h-5 w-5" />}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {isPatient ? doctorName : patientName}
                </h3>
                {isPatient && (
                  <Badge variant="success" size="sm" dot>
                    Verified
                  </Badge>
                )}
                <ConsentBadge status={consent.status} />
              </div>

              <p className="text-xs text-slate-500 truncate">
                {isPatient
                  ? `${doctorProfile?.specialization || 'Clinician'} • ${doctorProfile?.hospitalAffiliation || doctorProfile?.clinicName || 'CarePath Platform'}`
                  : `Patient Account • ${consent.patient?.email}`}
              </p>
            </div>
          </div>

          {/* Purpose & Rationale */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-700">Purpose:</span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-800 font-medium">
                {formatConsentPurpose(consent.purpose)}
              </span>
              <span className="text-[11px] text-slate-400">
                Requested {formatDate(consent.requestedAt)}
              </span>
            </div>
            <p className="text-slate-600 line-clamp-2 italic leading-relaxed pt-0.5">
              &ldquo;{consent.purposeDescription}&rdquo;
            </p>
          </div>

          {/* Scope & Permissions tags */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-900 font-medium">
              <FileText className="h-3.5 w-3.5 text-teal-700" />
              <span>Scope: {scopeSummary}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium">
              {hasDownloadAccess ? (
                <>
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>View & Download</span>
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Only</span>
                </>
              )}
            </div>

            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-medium ${expiry.badgeClass}`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {consent.status === 'APPROVED'
                  ? expiry.text
                  : `Expires ${formatDate(consent.expiresAt)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Contextual Action Buttons */}
        <div className="flex flex-row md:flex-col items-center md:items-end justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {/* Patient Pending Actions */}
          {isPatient && consent.status === 'PENDING' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onReview && onReview(consent)}
                leftIcon={<ShieldCheck className="h-3.5 w-3.5" />}
              >
                Review Request
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDecline && onDecline(consent)}
              >
                Decline
              </Button>
            </>
          )}

          {/* Patient Active Actions */}
          {isPatient && consent.status === 'APPROVED' && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewDetails && onViewDetails(consent)}
              >
                View Scope
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRevoke && onRevoke(consent)}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
              >
                Revoke Access
              </Button>
            </>
          )}

          {/* Doctor Pending Actions */}
          {!isPatient && consent.status === 'PENDING' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel && onCancel(consent)}
              >
                Cancel Request
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewDetails && onViewDetails(consent)}
              >
                Details
              </Button>
            </>
          )}

          {/* Doctor Active Actions */}
          {!isPatient && consent.status === 'APPROVED' && (
            <>
              <Link href={`/app/patients/${consent.patientId}`}>
                <Button
                  variant="primary"
                  size="sm"
                  rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  Open Workspace
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewDetails && onViewDetails(consent)}
              >
                View Scope
              </Button>
            </>
          )}

          {/* Historical Actions */}
          {(consent.status === 'REVOKED' ||
            consent.status === 'EXPIRED' ||
            consent.status === 'DECLINED' ||
            consent.status === 'CANCELLED') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onViewDetails && onViewDetails(consent)}
            >
              Audit Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
