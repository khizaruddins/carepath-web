'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api/audit';
import { useAuth } from '@/lib/auth-context';
import { formatDateTime } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ShieldCheck,
  Lock,
  Eye,
  FileUp,
  Edit3,
  Key,
  LogIn,
  LogOut,
  Stethoscope,
  Pill,
  CalendarCheck,
  ClipboardList,
  UserCheck,
} from 'lucide-react';

export default function ActivityPage() {
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['my-audit-logs', user?.id],
    queryFn: () => auditApi.getMyAuditLogs({ limit: 100 }),
  });

  const getActionDetails = (action: string) => {
    switch (action) {
      case 'LOGIN':
        return { label: 'Account Signed In', icon: LogIn, variant: 'neutral' as const };
      case 'LOGOUT':
        return { label: 'Session Signed Out', icon: LogOut, variant: 'neutral' as const };
      case 'VIEW_PATIENT':
        return { label: 'Authorized Patient Chart Accessed', icon: UserCheck, variant: 'info' as const };
      case 'VIEW_DOCUMENT':
        return { label: 'Patient Record Viewed (Secure Token)', icon: Eye, variant: 'info' as const };
      case 'DOWNLOAD_DOCUMENT':
        return { label: 'Medical Document Downloaded (Signed URL)', icon: Lock, variant: 'info' as const };
      case 'DOCUMENT_UPLOAD':
        return { label: 'Medical Document Uploaded', icon: FileUp, variant: 'brand' as const };
      case 'DOCUMENT_VIEW':
        return { label: 'Medical Document Viewed', icon: Eye, variant: 'info' as const };
      case 'DOCUMENT_DOWNLOAD':
        return { label: 'Document Downloaded', icon: Lock, variant: 'info' as const };
      case 'DOCUMENT_UPDATE':
        return { label: 'Document Feedback / Metadata Updated', icon: Edit3, variant: 'brand' as const };
      case 'DOCUMENT_DELETE':
        return { label: 'Document Archived', icon: Lock, variant: 'warning' as const };
      case 'CREATE_CONSULTATION':
        return { label: 'Clinical Consultation Note Recorded', icon: Stethoscope, variant: 'brand' as const };
      case 'UPDATE_CONSULTATION':
        return { label: 'Consultation Note Updated', icon: Edit3, variant: 'brand' as const };
      case 'CREATE_PRESCRIPTION':
        return { label: 'Electronic Prescription Issued', icon: Pill, variant: 'brand' as const };
      case 'CREATE_INVESTIGATION':
        return { label: 'Diagnostic Investigation Ordered', icon: ClipboardList, variant: 'warning' as const };
      case 'CREATE_REFERRAL':
        return { label: 'Specialist Referral Dispatched', icon: ShieldCheck, variant: 'brand' as const };
      case 'CREATE_FOLLOW_UP':
        return { label: 'Clinical Follow-up Scheduled', icon: CalendarCheck, variant: 'info' as const };
      case 'UPDATE_FOLLOW_UP':
        return { label: 'Follow-up Status Updated', icon: CalendarCheck, variant: 'success' as const };
      case 'PROFILE_VIEW':
        return { label: 'Profile Record Viewed', icon: Eye, variant: 'neutral' as const };
      case 'PROFILE_UPDATE':
        return { label: 'Profile Baseline Updated', icon: Edit3, variant: 'success' as const };
      case 'PASSWORD_CHANGE':
        return { label: 'Account Password Changed', icon: Key, variant: 'warning' as const };
      case 'SECURITY_EVENT':
        return { label: 'Security Event Registered', icon: ShieldCheck, variant: 'warning' as const };
      default:
        return { label: action.replace(/_/g, ' '), icon: ShieldCheck, variant: 'neutral' as const };
    }
  };

  const renderDetailsSummary = (details?: Record<string, any>) => {
    if (!details || typeof details !== 'object' || Object.keys(details).length === 0) return null;
    const parts: string[] = [];

    if (details.investigation) parts.push(`Test: ${details.investigation}`);
    if (details.specialty) parts.push(`Specialty: ${details.specialty}`);
    if (details.itemCount) parts.push(`${details.itemCount} items`);
    if (details.status) parts.push(`Status: ${details.status}`);
    if (details.dueDate) parts.push(`Due: ${new Date(details.dueDate).toLocaleDateString()}`);

    if (parts.length === 0) return null;
    return <span className="text-slate-600 font-medium">{parts.join(' • ')}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {isDoctor ? 'Clinical Activity & Compliance Audit Trail' : 'Account Activity & Security Audit Log'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {isDoctor
            ? 'Immutable, tamper-evident regulatory trail of clinical notes, document reviews, prescriptions, and patient access events.'
            : 'Immutable ledger recording all authentication, access requests, and document operations.'}
        </p>
      </div>

      {/* Security Reassurance Banner */}
      <div className="p-4 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {isDoctor ? (
            <>
              Every sensitive clinical and security action — including viewing patient records, accessing medical
              documents, writing consultations, and issuing prescriptions — is recorded in an immutable ledger.
              This maintains strict medicolegal compliance and full accountability under patient consent grants.
            </>
          ) : (
            <>
              Every sensitive action performed on your CarePath Health Vault is logged immutably.
              Audit records include the action type, result, timestamp, and network address, ensuring
              zero unmonitored access to your medical information.
            </>
          )}
        </p>
      </div>

      {isLoading && <LoadingSpinner message="Retrieving immutable audit records..." />}

      {error && (
        <ErrorMessage
          title="Could not load activity records"
          message={(error as any)?.message || 'An error occurred.'}
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && (!logs || logs.length === 0) && (
        <EmptyState
          icon={<ShieldCheck className="h-6 w-6 text-slate-400" />}
          title="No Activity Logged Yet"
          description={
            isDoctor
              ? 'Your clinical actions, consultations, and document reviews will automatically appear in this compliance audit log.'
              : 'Your security ledger will display all document views, uploads, and logins as you interact with the platform.'
          }
        />
      )}

      {!isLoading && logs && logs.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {logs.map((log) => {
            const details = getActionDetails(log.action);
            const Icon = details.icon;
            const extraSummary = renderDetailsSummary(log.details);

            return (
              <div
                key={log.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-teal-800" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{details.label}</span>
                      <Badge variant={details.variant} size="sm">
                        {log.result}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-0.5">
                      <span>Resource: {log.resourceType}</span>
                      {extraSummary}
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>

                <div className="text-right sm:shrink-0 text-[11px] text-slate-500 font-medium">
                  {formatDateTime(log.timestamp)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
