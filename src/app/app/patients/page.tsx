'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { doctorApi, AssignedPatient } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { RequestAccessModal } from '@/components/doctor/RequestAccessModal';
import { RequestConsentModal } from '@/components/consents/RequestConsentModal';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Search,
  Send,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  FileText,
  AlertCircle,
  ExternalLink,
  Filter,
  UserPlus,
  KeyRound,
} from 'lucide-react';

export default function ConnectedPatientsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'PENDING_REPORTS' | 'FOLLOW_UP_DUE'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'NAME' | 'FOLLOW_UP'>('RECENT');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [targetPatient, setTargetPatient] = useState<{ id: string; name: string } | null>(null);

  const {
    data: patients,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctor-assigned-patients', search],
    queryFn: () => doctorApi.getDoctorAssignedPatients(search || undefined),
    enabled: !!user,
  });

  // Filter logic
  const filteredPatients = (patients || []).filter((item) => {
    if (filterMode === 'PENDING_REPORTS') {
      return (item.clinicalSnapshot?.pendingReportsCount || 0) > 0;
    }
    if (filterMode === 'FOLLOW_UP_DUE') {
      return !!item.clinicalSnapshot?.nextFollowUpDate;
    }
    return true;
  });

  // Sort logic
  const sortedPatients = [...filteredPatients].sort((a, b) => {
    if (sortBy === 'NAME') {
      return (a.patient.fullName || '').localeCompare(b.patient.fullName || '');
    }
    if (sortBy === 'FOLLOW_UP') {
      const dateA = a.clinicalSnapshot?.nextFollowUpDate ? new Date(a.clinicalSnapshot.nextFollowUpDate).getTime() : Infinity;
      const dateB = b.clinicalSnapshot?.nextFollowUpDate ? new Date(b.clinicalSnapshot.nextFollowUpDate).getTime() : Infinity;
      return dateA - dateB;
    }
    return new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime();
  });

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-teal-700" />
            Connected Patients
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Patients who have established a clinical relationship and authorized healthcare vault access.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRequestModalOpen(true)}
            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
          >
            Connect Patient
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setTargetPatient(null);
              setConsentModalOpen(true);
            }}
            leftIcon={<KeyRound className="h-3.5 w-3.5" />}
          >
            Request Records Access
          </Button>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search by patient name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <Select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            options={[
              { label: 'All Patients', value: 'ALL' },
              { label: 'Reports Awaiting Review', value: 'PENDING_REPORTS' },
              { label: 'Upcoming Follow-ups', value: 'FOLLOW_UP_DUE' },
            ]}
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            options={[
              { label: 'Sort: Recently Connected', value: 'RECENT' },
              { label: 'Sort: Patient Name', value: 'NAME' },
              { label: 'Sort: Next Follow-up', value: 'FOLLOW_UP' },
            ]}
          />
        </div>
      </div>

      {/* Patient Data Display: Responsive Table on Desktop, Cards on Mobile */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Retrieving authorized patient cohorts..." />
        </div>
      ) : sortedPatients.length > 0 ? (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-lg border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Relationship & Scope</th>
                  <th className="py-3 px-4">Last Consultation</th>
                  <th className="py-3 px-4">Next Follow-up</th>
                  <th className="py-3 px-4">Pending Reports</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPatients.map((item) => {
                  const unreviewed = item.clinicalSnapshot?.pendingReportsCount || 0;
                  const nextFu = item.clinicalSnapshot?.nextFollowUpDate;
                  const lastConsult = item.clinicalSnapshot?.lastConsultationDate;

                  return (
                    <tr key={item.accessId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {item.patient.fullName || item.patient.email}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {item.patient.gender ? item.patient.gender.toLowerCase() : 'Patient'} •{' '}
                          {item.patient.city || 'India'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">
                          {item.relationshipType?.replace('_', ' ') || 'Primary Physician'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.accessScope?.length || 0} categories authorized
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {lastConsult ? (
                          <div>
                            <span className="font-medium text-slate-800">{formatDate(lastConsult)}</span>
                            {item.clinicalSnapshot?.lastConsultationReason && (
                              <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                                {item.clinicalSnapshot.lastConsultationReason}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">None recorded</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {nextFu ? (
                          <div className="flex items-center gap-1.5 text-teal-800 font-medium">
                            <CalendarCheck className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                            <span>{formatDate(nextFu)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No follow-up set</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {unreviewed > 0 ? (
                          <Badge variant="warning" size="sm" dot>
                            {unreviewed} awaiting review
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Up to date
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="success" size="sm">
                          Active Consent
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setTargetPatient({
                                id: item.patientId,
                                name: item.patient.fullName || item.patient.email,
                              });
                              setConsentModalOpen(true);
                            }}
                            leftIcon={<KeyRound className="h-3 w-3 text-teal-700" />}
                          >
                            Request Records
                          </Button>
                          <Link href={`/app/patients/${item.patientId}`}>
                            <Button size="sm" variant="secondary" rightIcon={<ArrowRight className="h-3 w-3" />}>
                              Workspace
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {sortedPatients.map((item) => (
              <Card key={item.accessId} className="hover:border-teal-700/30 transition-colors">
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        {item.patient.fullName || item.patient.email}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {item.patient.gender} • {item.patient.city || 'India'}
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-1 py-2 border-y border-slate-100 text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Documents:</span>
                      <span className="font-medium text-slate-800">{item.patient.totalDocuments}</span>
                    </div>
                    {item.clinicalSnapshot?.pendingReportsCount ? (
                      <div className="flex justify-between text-amber-700 font-medium">
                        <span>Reports Pending:</span>
                        <span>{item.clinicalSnapshot.pendingReportsCount}</span>
                      </div>
                    ) : null}
                    {item.clinicalSnapshot?.nextFollowUpDate && (
                      <div className="flex justify-between text-teal-800 font-medium">
                        <span>Next Follow-up:</span>
                        <span>{formatDate(item.clinicalSnapshot.nextFollowUpDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-1 flex justify-end">
                    <Link href={`/app/patients/${item.patientId}`} className="w-full">
                      <Button size="sm" variant="primary" className="w-full">
                        Open Patient Workspace
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No connected patients found"
          description={
            search
              ? `No patients match "${search}". Try adjusting your search query.`
              : 'You have not connected with any patients yet. Send a connection invitation to a patient’s registered email address to begin.'
          }
          icon={<Users className="h-6 w-6 text-slate-400" />}
          action={
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRequestModalOpen(true)}
              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
            >
              Connect Patient by Email
            </Button>
          }
        />
      )}

      {/* 1. Connect Patient Modal (Email Invitation) */}
      <RequestAccessModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* 2. Request Record Consent Modal (Connected Patient Dropdown) */}
      <RequestConsentModal
        isOpen={consentModalOpen}
        onClose={() => {
          setConsentModalOpen(false);
          setTargetPatient(null);
        }}
        preselectedPatientId={targetPatient?.id}
        preselectedPatientName={targetPatient?.name}
        onSuccess={() => refetch()}
        onOpenConnectPatient={() => {
          setConsentModalOpen(false);
          setRequestModalOpen(true);
        }}
      />
    </div>
  );
}
