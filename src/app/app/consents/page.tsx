'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentsApi } from '@/lib/api/consents';
import { useAuth } from '@/lib/auth-context';
import { Consent, ConsentStatus } from '@/lib/api/types';
import { ConsentCard } from '@/components/consents/ConsentCard';
import { ConsentReviewModal } from '@/components/consents/ConsentReviewModal';
import { DeclineConfirmModal } from '@/components/consents/DeclineConfirmModal';
import { RevokeConfirmModal } from '@/components/consents/RevokeConfirmModal';
import { ConsentDetailsModal } from '@/components/consents/ConsentDetailsModal';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  KeyRound,
  ShieldCheck,
  Clock,
  History,
  CheckCircle2,
  Lock,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

type TabType = 'PENDING' | 'ACTIVE' | 'HISTORY';

export default function PatientConsentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');

  // Modal states
  const [reviewingConsent, setReviewingConsent] = useState<Consent | null>(null);
  const [decliningConsent, setDecliningConsent] = useState<Consent | null>(null);
  const [revokingConsent, setRevokingConsent] = useState<Consent | null>(null);
  const [detailsConsent, setDetailsConsent] = useState<Consent | null>(null);

  // Queries
  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['consents', 'pending'],
    queryFn: () => consentsApi.getPendingConsents(),
    enabled: !!user,
  });

  const { data: activeData, isLoading: isLoadingActive } = useQuery({
    queryKey: ['consents', 'active'],
    queryFn: () => consentsApi.getActiveConsents(),
    enabled: !!user,
  });

  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['consents', 'history'],
    queryFn: () => consentsApi.getConsentHistory(50, 0),
    enabled: !!user,
  });

  // Filter history to non-pending and non-active
  const historicalConsents =
    historyData?.consents.filter(
      (c) =>
        c.status === 'DECLINED' ||
        c.status === 'REVOKED' ||
        c.status === 'EXPIRED' ||
        c.status === 'CANCELLED',
    ) || [];

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => consentsApi.approveConsent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      consentsApi.declineConsent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      consentsApi.revokeConsent(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const pendingCount = pendingData?.total ?? 0;
  const activeCount = activeData?.total ?? 0;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <KeyRound className="h-6 w-6 text-teal-700" />
            Consent & Secure Sharing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explicitly authorize who can view your health records, what categories they can access, and for how long.
          </p>
        </div>

        {/* Security Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 text-xs">
          <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
          <span className="font-semibold">Patient-Owned Vault</span>
        </div>
      </div>

      {/* Security Principles Banner */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Lock className="h-4 w-4 text-teal-700" />
            Zero Presumed Access
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Connecting with a doctor does not grant access. You must explicitly approve every request.
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Clock className="h-4 w-4 text-teal-700" />
            Time-Bound Permissions
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            All consents include mandatory expiration windows and automatically expire when the care window closes.
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <CheckCircle2 className="h-4 w-4 text-teal-700" />
            Instant Revocation
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            You can revoke access to any active physician at any moment with immediate effect.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'PENDING'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Pending Requests</span>
          {pendingCount > 0 && (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'ACTIVE'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active Grants</span>
          {activeCount > 0 && (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`pb-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Sharing History</span>
        </button>
      </div>

      {/* TAB CONTENT: PENDING */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {isLoadingPending ? (
            <div className="py-12">
              <LoadingSpinner message="Checking pending authorization requests..." />
            </div>
          ) : pendingData?.consents && pendingData.consents.length > 0 ? (
            <div className="space-y-3">
              {pendingData.consents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="PATIENT"
                  onReview={(c) => setReviewingConsent(c)}
                  onDecline={(c) => setDecliningConsent(c)}
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Pending Access Requests"
              description="Whenever a doctor requests permission to review your medical documents or test results, their credentials and clinical rationale will appear here for your review."
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVE */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {isLoadingActive ? (
            <div className="py-12">
              <LoadingSpinner message="Retrieving active consents..." />
            </div>
          ) : activeData?.consents && activeData.consents.length > 0 ? (
            <div className="space-y-3">
              {activeData.consents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="PATIENT"
                  onRevoke={(c) => setRevokingConsent(c)}
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Active Record Sharing"
              description="Your medical vault is completely private. No external clinicians or healthcare providers currently have active permissions to view your records."
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {isLoadingHistory ? (
            <div className="py-12">
              <LoadingSpinner message="Loading historical records..." />
            </div>
          ) : historicalConsents.length > 0 ? (
            <div className="space-y-3">
              {historicalConsents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="PATIENT"
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Historical Consents"
              description="Past access requests that were revoked, declined, or expired will be archived here for your security records."
            />
          )}
        </div>
      )}

      {/* Modals */}
      {reviewingConsent && (
        <ConsentReviewModal
          isOpen={!!reviewingConsent}
          onClose={() => setReviewingConsent(null)}
          consent={reviewingConsent}
          onApprove={async (id) => {
            await approveMutation.mutateAsync(id);
          }}
          onDecline={async (id, reason) => {
            await declineMutation.mutateAsync({ id, reason });
          }}
        />
      )}

      {decliningConsent && (
        <DeclineConfirmModal
          isOpen={!!decliningConsent}
          onClose={() => setDecliningConsent(null)}
          onConfirm={async (reason) => {
            await declineMutation.mutateAsync({ id: decliningConsent.id, reason });
          }}
          requesterName={
            decliningConsent.requester?.doctorProfile?.fullName || 'the requesting physician'
          }
        />
      )}

      {revokingConsent && (
        <RevokeConfirmModal
          isOpen={!!revokingConsent}
          onClose={() => setRevokingConsent(null)}
          onConfirm={async (reason) => {
            await revokeMutation.mutateAsync({ id: revokingConsent.id, reason });
          }}
          requesterName={
            revokingConsent.requester?.doctorProfile?.fullName || 'the physician'
          }
        />
      )}

      {detailsConsent && (
        <ConsentDetailsModal
          isOpen={!!detailsConsent}
          onClose={() => setDetailsConsent(null)}
          consent={detailsConsent}
          userRole="PATIENT"
          onRevoke={(c) => {
            setDetailsConsent(null);
            setRevokingConsent(c);
          }}
        />
      )}
    </div>
  );
}
