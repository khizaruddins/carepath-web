'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';
import { documentsApi } from '@/lib/api/documents';
import { timelineApi } from '@/lib/api/timeline';
import { auditApi } from '@/lib/api/audit';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingCard, LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { DoctorDashboardView } from '@/components/doctor/DoctorDashboardView';
import { AdminDashboardView } from '@/components/admin/AdminDashboardView';
import { LabDashboardView } from '@/components/lab/LabDashboardView';
import { ActionItemsPanel } from '@/components/ui/ActionItemsPanel';
import { formatDate, formatCategory, formatBloodGroup } from '@/lib/utils';
import {
  FileText,
  Clock,
  HeartPulse,
  Upload,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  FolderLock,
  CalendarCheck2,
  FlaskConical,
} from 'lucide-react';
import { usePatientInvestigations } from '@/lib/hooks/use-lab-marketplace';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user?.role === 'ADMIN') {
    return <AdminDashboardView />;
  }

  if (user?.role === 'DOCTOR') {
    return <DoctorDashboardView />;
  }

  if (user?.role === 'LAB') {
    return <LabDashboardView />;
  }

  return <PatientDashboardView />;
}

function PatientDashboardView() {
  const { user } = useAuth();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // 1. Fetch Profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: () => patientsApi.getMyProfile(),
    enabled: !!user,
  });

  // 2. Fetch Recent Documents
  const {
    data: documentsData,
    isLoading: docsLoading,
    refetch: refetchDocs,
  } = useQuery({
    queryKey: ['recent-documents'],
    queryFn: () => documentsApi.getDocuments({ limit: 4 }),
    enabled: !!user,
  });

  // 3. Fetch Recent Timeline Events
  const {
    data: timelineData,
    isLoading: timelineLoading,
    refetch: refetchTimeline,
  } = useQuery({
    queryKey: ['recent-timeline'],
    queryFn: () => timelineApi.getTimeline({ limit: 4 }),
    enabled: !!user,
  });

  // 4. Fetch Recent Audit Activity
  const { data: auditLogs } = useQuery({
    queryKey: ['recent-audit-logs'],
    queryFn: () => auditApi.getMyAuditLogs({ limit: 3 }),
    enabled: !!user,
  });

  // 5. Fetch Investigations
  const { data: investigations } = usePatientInvestigations();
  const pendingInvestigations = investigations?.filter((i) => i.status === 'REQUESTED') || [];

  // Greeting helper based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const patientName = profile?.fullName || user?.patientProfile?.fullName || 'Patient';
  const totalDocuments = documentsData?.total ?? 0;
  const totalEvents = timelineData?.total ?? 0;
  const totalInvestigations = investigations?.length ?? 0;

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Header & Greeting Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {getGreeting()}, {patientName.split(' ')[0]}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            CarePath Patient Health Vault • Longitudinal Record Summary
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setUploadModalOpen(true)}
            leftIcon={<Upload className="h-3.5 w-3.5" />}
          >
            Upload Document
          </Button>
          <Link href="/app/profile">
            <Button variant="outline" size="sm">
              Edit Health Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Actionable Items — real-time pending tasks */}
      <ActionItemsPanel maxItems={5} />

      {/* Pending Investigation Banner if any */}
      {pendingInvestigations.length > 0 && (
        <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <FlaskConical className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-teal-950 text-sm block">
                {pendingInvestigations.length} Diagnostic Test{pendingInvestigations.length > 1 ? 's' : ''} Awaiting Lab Selection
              </span>
              <p className="text-teal-800 text-[11px] mt-0.5">
                Your doctor prescribed <strong>{pendingInvestigations[0].testName || pendingInvestigations[0].investigationName || 'Prescribed Test'}</strong>
                {pendingInvestigations.length > 1 ? ` and ${pendingInvestigations.length - 1} other test(s)` : ''}. Compare accredited labs nearby and book home collection.
              </p>
            </div>
          </div>
          <Link href={`/app/investigations/${pendingInvestigations[0].id}/labs`} className="shrink-0">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
              Compare Labs
            </Button>
          </Link>
        </div>
      )}

      {/* Critical Medical Summary Card (Health Baseline) */}
      <Card className="border-teal-200/80 bg-gradient-to-r from-teal-50/50 via-white to-white shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-teal-700" />
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Clinical Baseline
              </h2>
            </div>
            <Link
              href="/app/profile"
              className="text-xs text-teal-800 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Manage profile</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Blood Group</span>
              <span className="font-bold text-slate-900 text-sm">
                {profile?.bloodGroup ? formatBloodGroup(profile.bloodGroup) : 'Not recorded'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Allergies</span>
              {profile?.allergies && profile.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {profile.allergies.map((allergy, i) => (
                    <Badge key={i} variant="error" size="sm">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600 font-medium">None reported</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Active Conditions</span>
              {profile?.knownConditions && profile.knownConditions.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {profile.knownConditions.map((cond, i) => (
                    <Badge key={i} variant="warning" size="sm">
                      {cond}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-slate-600 font-medium">None reported</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
              <span className="font-medium text-slate-800">
                {profile?.emergencyContactName
                  ? `${profile.emergencyContactName} (${profile.emergencyContactRelation || 'Contact'})`
                  : 'Not set'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vault Status Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <FolderLock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalDocuments}</p>
            <p className="text-xs text-slate-500 font-medium">Health Records Stored</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalEvents}</p>
            <p className="text-xs text-slate-500 font-medium">Timeline Events Recorded</p>
          </div>
        </div>

        <Link href="/app/investigations" className="block">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex items-center gap-3 hover:border-teal-700/40 transition-colors">
            <div className="h-10 w-10 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
              <FlaskConical className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{totalInvestigations}</p>
              <p className="text-xs text-slate-500 font-medium">
                {pendingInvestigations.length > 0 ? (
                  <span className="text-amber-700 font-bold">
                    {pendingInvestigations.length} Action Needed
                  </span>
                ) : (
                  'Diagnostic Orders'
                )}
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Recent Documents + Recent Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Recent Documents */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Recent Health Records
            </h3>
            <Link
              href="/app/documents"
              className="text-xs text-teal-800 font-semibold hover:underline"
            >
              View all ({totalDocuments})
            </Link>
          </div>

          {docsLoading ? (
            <div className="space-y-3">
              <LoadingCard />
              <LoadingCard />
            </div>
          ) : !documentsData?.documents || documentsData.documents.length === 0 ? (
            <EmptyState
              icon={<FileText className="h-6 w-6 text-slate-400" />}
              title="No Medical Records Uploaded Yet"
              description="Upload your laboratory panels, prescriptions, imaging reports, or consultation notes to organize your private medical vault."
              actionLabel="Upload First Document"
              onAction={() => setUploadModalOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {documentsData.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 rounded-md bg-teal-50 text-teal-800 flex items-center justify-center shrink-0 border border-teal-100">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/app/documents/${doc.id}`}
                        className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-teal-800 hover:underline truncate block"
                      >
                        {doc.metadata?.reportTitle || formatCategory(doc.category)}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {formatCategory(doc.category)} •{' '}
                        {doc.metadata?.providerName || doc.metadata?.facility || 'Self-Uploaded'} •{' '}
                        {formatDate(doc.metadata?.documentDate || doc.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {doc.metadata?.isPatientConfirmed ? (
                      <Badge variant="success" size="sm" dot>
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>
                        Needs Review
                      </Badge>
                    )}
                    <Link href={`/app/documents/${doc.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Upcoming Context & Timeline Feed */}
        <div className="space-y-6">
          {/* Upcoming Section */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck2 className="h-3.5 w-3.5 text-teal-700" />
              <span>Upcoming Care Tasks</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No upcoming appointments or required follow-ups scheduled for this period.
            </p>
          </div>

          {/* Recent Timeline Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                Timeline Activity
              </h4>
              <Link
                href="/app/timeline"
                className="text-xs text-teal-800 font-semibold hover:underline"
              >
                Full Timeline
              </Link>
            </div>

            {timelineLoading ? (
              <LoadingSpinner message="Loading timeline..." />
            ) : !(timelineData?.items || timelineData?.events) || (timelineData.items || timelineData.events || []).length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                Timeline events will appear automatically as you upload records.
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-3 space-y-3 text-xs">
                {(timelineData.items || timelineData.events || []).map((evt) => (
                  <div key={evt.id} className="border-l-2 border-teal-700 pl-3 space-y-0.5">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      {formatDate(evt.eventDate)}
                    </p>
                    <p className="font-semibold text-slate-900">{evt.title}</p>
                    {(evt.summary || evt.description) && (
                      <p className="text-[11px] text-slate-500">{evt.summary || evt.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Access Security Audit Card */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Security Access Log</span>
              </span>
              <Link href="/app/activity" className="text-[11px] text-teal-800 hover:underline">
                View all
              </Link>
            </div>
            {auditLogs && auditLogs.length > 0 ? (
              <div className="space-y-1 text-[11px] text-slate-600">
                {auditLogs.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex justify-between py-0.5 border-b border-slate-200/50">
                    <span className="font-medium text-slate-700">{log.action.replace('_', ' ')}</span>
                    <span className="text-slate-400">{formatDate(log.timestamp)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">All interactions are logged immutably.</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          refetchDocs();
          refetchTimeline();
        }}
      />
    </div>
  );
}
