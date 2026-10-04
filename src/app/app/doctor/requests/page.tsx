'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consentsApi } from '@/lib/api/consents';
import { useAuth } from '@/lib/auth-context';
import { Consent, ConsentStatus } from '@/lib/api/types';
import { ConsentCard } from '@/components/consents/ConsentCard';
import { RequestConsentModal } from '@/components/consents/RequestConsentModal';
import { RequestAccessModal } from '@/components/doctor/RequestAccessModal';
import { ConsentDetailsModal } from '@/components/consents/ConsentDetailsModal';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import {
  KeyRound,
  Send,
  Clock,
  CheckCircle2,
  History,
  ShieldCheck,
  AlertCircle,
  UserPlus,
} from 'lucide-react';

type TabType = 'PENDING' | 'ACTIVE' | 'HISTORY';

export default function DoctorConsentRequestsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');

  // Modal states
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [detailsConsent, setDetailsConsent] = useState<Consent | null>(null);

  // Queries
  const { data: pendingData, isLoading: isLoadingPending } = useQuery({
    queryKey: ['doctor-consents', 'pending'],
    queryFn: () => consentsApi.getDoctorConsentRequests({ status: 'PENDING' }),
    enabled: !!user,
  });

  const { data: activeData, isLoading: isLoadingActive } = useQuery({
    queryKey: ['doctor-consents', 'active'],
    queryFn: () => consentsApi.getDoctorConsentRequests({ status: 'APPROVED' }),
    enabled: !!user,
  });

  const { data: allData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['doctor-consents', 'all'],
    queryFn: () => consentsApi.getDoctorConsentRequests({ limit: 50, offset: 0 }),
    enabled: !!user,
  });

  // Filter historical consents
  const historicalConsents =
    allData?.consents.filter(
      (c) =>
        c.status === 'DECLINED' ||
        c.status === 'REVOKED' ||
        c.status === 'EXPIRED' ||
        c.status === 'CANCELLED',
    ) || [];

  // Mutations
  const cancelMutation = useMutation({
    mutationFn: (id: string) => consentsApi.cancelConsent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-consents'] });
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
            Patient Consent Requests
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your scoped authorization requests and active clinical vault access across your patients.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConnectModalOpen(true)}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Connect Patient
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            leftIcon={<KeyRound className="h-3.5 w-3.5" />}
          >
            Request Record Access
          </Button>
        </div>
      </div>

      {/* Tabs */}
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
          <span>Active Authorizations</span>
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
          <span>Request History</span>
        </button>
      </div>

      {/* TAB CONTENT: PENDING */}
      {activeTab === 'PENDING' && (
        <div className="space-y-4">
          {isLoadingPending ? (
            <div className="py-12">
              <LoadingSpinner message="Retrieving pending requests..." />
            </div>
          ) : pendingData?.consents && pendingData.consents.length > 0 ? (
            <div className="space-y-3">
              {pendingData.consents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="DOCTOR"
                  onCancel={(c) => cancelMutation.mutate(c.id)}
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Pending Requests"
              description="You have no outgoing access requests awaiting patient review."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setRequestModalOpen(true)}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Request Patient Access
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: ACTIVE */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {isLoadingActive ? (
            <div className="py-12">
              <LoadingSpinner message="Retrieving active authorizations..." />
            </div>
          ) : activeData?.consents && activeData.consents.length > 0 ? (
            <div className="space-y-3">
              {activeData.consents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="DOCTOR"
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Active Authorizations"
              description="You do not currently have active approved access to any patient vaults. Submit an access request when scheduling consultations or reviewing diagnostics."
              action={
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setRequestModalOpen(true)}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Request Patient Access
                </Button>
              }
            />
          )}
        </div>
      )}

      {/* TAB CONTENT: HISTORY */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {isLoadingAll ? (
            <div className="py-12">
              <LoadingSpinner message="Loading request history..." />
            </div>
          ) : historicalConsents.length > 0 ? (
            <div className="space-y-3">
              {historicalConsents.map((consent) => (
                <ConsentCard
                  key={consent.id}
                  consent={consent}
                  viewerRole="DOCTOR"
                  onViewDetails={(c) => setDetailsConsent(c)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Request History"
              description="Historical requests that expired, were declined, or were revoked will appear here."
            />
          )}
        </div>
      )}

      {/* 1. Connect Patient Modal (Email Invitation) */}
      <RequestAccessModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['doctor-assigned-patients'] });
        }}
      />

      {/* 2. Request Record Consent Modal */}
      <RequestConsentModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['doctor-consents'] });
        }}
        onOpenConnectPatient={() => {
          setRequestModalOpen(false);
          setConnectModalOpen(true);
        }}
      />

      {/* Details Modal */}
      {detailsConsent && (
        <ConsentDetailsModal
          isOpen={!!detailsConsent}
          onClose={() => setDetailsConsent(null)}
          consent={detailsConsent}
          userRole="DOCTOR"
        />
      )}
    </div>
  );
}
