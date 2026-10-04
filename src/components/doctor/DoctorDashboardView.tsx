'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { LoadingSpinner } from '../ui/LoadingState';
import { RequestAccessModal } from './RequestAccessModal';
import { RequestConsentModal } from '@/components/consents/RequestConsentModal';
import { ActionItemsPanel } from '../ui/ActionItemsPanel';
import { formatDate, formatDateTime, formatCategory } from '@/lib/utils';
import {
  Users,
  KeyRound,
  Send,
  ArrowRight,
  Clock,
  FileText,
  AlertTriangle,
  CalendarCheck,
  Stethoscope,
  ChevronRight,
  UserPlus,
} from 'lucide-react';

export function DoctorDashboardView() {
  const { user } = useAuth();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [consentModalOpen, setConsentModalOpen] = useState(false);

  // 1. Fetch Doctor Profile (for verification status)
  const { data: profile } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: () => doctorApi.getDoctorProfile(),
    enabled: !!user,
  });

  // 2. Fetch Doctor Dashboard Clinical Workflow Data
  const {
    data: dashboard,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctor-dashboard-workflow'],
    queryFn: () => doctorApi.getDoctorDashboard(),
    enabled: !!user,
  });

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isPendingVerification = profile?.verificationStatus === 'PENDING';
  const isRejected = profile?.verificationStatus === 'REJECTED';

  if (isLoading) {
    return <LoadingSpinner message="Loading your clinical patient journey..." />;
  }

  const metrics = dashboard?.metrics || {
    activePatientsCount: 0,
    todayConsultationsCount: 0,
    reportsAwaitingReviewCount: 0,
    followUpsDueCount: 0,
    pendingRequestsCount: 0,
  };

  const todayConsultations = dashboard?.todayConsultations || [];
  const followUpsDue = dashboard?.followUpsDue || [];
  const reportsAwaitingReview = dashboard?.reportsAwaitingReview || [];
  const recentActivity = dashboard?.recentActivity || [];


  return (
    <div className="space-y-6 text-left">
      {/* 1. Verification Alert Banner if not VERIFIED */}
      {!isVerified && (
        <div
          className={`rounded-lg p-4 border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isPendingVerification
              ? 'bg-amber-50/80 border-amber-200 text-amber-900'
              : isRejected
              ? 'bg-rose-50/80 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-4 w-4 shrink-0 mt-0.5 ${
                isPendingVerification ? 'text-amber-600' : 'text-rose-600'
              }`}
            />
            <div>
              <p className="font-bold">
                {isPendingVerification
                  ? 'Professional Profile Submitted — Verification in Progress'
                  : isRejected
                  ? 'Verification Requires Profile Updates'
                  : 'Complete Your Professional Credentials'}
              </p>
              <p className="mt-0.5 text-slate-600">
                {isPendingVerification
                  ? `Your medical credentials were submitted on ${
                      profile?.verificationSubmittedAt ? formatDate(profile.verificationSubmittedAt) : 'recently'
                    }. Our administrative team is reviewing your registration number.`
                  : isRejected
                  ? `Reason: ${profile?.rejectionReason || 'Credentials could not be verified'}. Please update your license registration details and resubmit.`
                  : 'To ensure patient trust and clinical accountability, submit your medical council registration and practice details.'}
              </p>
            </div>
          </div>
          <Link href="/app/doctor/profile" className="shrink-0">
            <Button size="sm" variant={isRejected ? 'destructive' : 'outline'}>
              {isRejected ? 'Update & Resubmit' : 'Manage Profile'}
            </Button>
          </Link>
        </div>
      )}

      {/* 2. Top Header & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Clinical Workspace
            </h1>
            <Badge
              variant={isVerified ? 'success' : isPendingVerification ? 'warning' : 'neutral'}
              size="sm"
              dot
            >
              {isVerified ? 'Verified Physician' : profile?.verificationStatus || 'Pending'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {profile?.fullName || 'Physician'} • {profile?.specialization || 'General Practice'} •{' '}
            {profile?.hospitalAffiliation || 'CarePath Network'}
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
            variant="outline"
            size="sm"
            onClick={() => setConsentModalOpen(true)}
            leftIcon={<KeyRound className="h-3.5 w-3.5 text-teal-700" />}
          >
            Request Records Access
          </Button>
          <Link href="/app/patients">
            <Button variant="primary" size="sm" leftIcon={<Users className="h-3.5 w-3.5" />}>
              View Connected Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* 3. Today's Clinical Attention Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link href="/app/doctor/consultations" className="block group">
          <Card className="hover:border-teal-700/40 transition-colors h-full">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Today’s Consults
                </span>
                <Clock className="h-4 w-4 text-teal-700" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.todayConsultationsCount}
              </div>
              <p className="text-[11px] text-slate-500">
                Recorded or scheduled for today
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/doctor/reports" className="block group">
          <Card className="hover:border-teal-700/40 transition-colors h-full">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Reports for Review
                </span>
                <FileText className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.reportsAwaitingReviewCount}
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                {metrics.reportsAwaitingReviewCount > 0 ? 'Requires clinical assessment' : 'All reports assessed'}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/doctor/follow-ups" className="block group">
          <Card className="hover:border-teal-700/40 transition-colors h-full">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Follow-ups Due
                </span>
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.followUpsDueCount}
              </div>
              <p className="text-[11px] text-slate-500">
                Due today or overdue
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/doctor/requests" className="block group">
          <Card className="hover:border-teal-700/40 transition-colors h-full">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  Consent Requests
                </span>
                <KeyRound className="h-4 w-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {metrics.pendingRequestsCount}
              </div>
              <p className="text-[11px] text-slate-500">
                Awaiting patient authorization
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 4. Actionable Columns: Action Items & Live Patient Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Unified Action Items & Reports Awaiting Review */}
        <div className="lg:col-span-2 space-y-6">
          {/* Real-time Action Items Panel */}
          <ActionItemsPanel maxItems={6} />

          {/* Reports Awaiting Review Preview */}
          {reportsAwaitingReview.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Diagnostic Reports Awaiting Review
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Newly uploaded patient records within your authorized consent scope.
                  </p>
                </div>
                <Link href="/app/doctor/reports">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                    View All ({reportsAwaitingReview.length})
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {reportsAwaitingReview.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {doc.metadata?.reportTitle || formatCategory(doc.category)}
                          </span>
                          <Badge variant="neutral" size="sm">
                            {formatCategory(doc.category)}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Patient: {(doc as any).patient?.patientProfile?.fullName || (doc as any).patient?.email} • Uploaded {formatDate(doc.createdAt)}
                        </p>
                      </div>

                      <Link href={`/app/documents/${doc.id}`}>
                        <Button size="sm" variant="outline" leftIcon={<FileText className="h-3.5 w-3.5 text-teal-700" />}>
                          Assess Report
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-ups Due Preview */}
          {followUpsDue.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">
                    Follow-ups Requiring Attention
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Patients scheduled for clinical review
                  </p>
                </div>
                <Link href="/app/doctor/follow-ups">
                  <Button variant="ghost" size="sm" className="text-xs text-teal-700 hover:text-teal-800">
                    View All ({followUpsDue.length})
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {followUpsDue.slice(0, 5).map((fu: any) => (
                    <div key={fu.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">{fu.reason}</span>
                          <Badge variant="warning" size="sm">Due {formatDate(fu.dueDate)}</Badge>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Patient: {fu.patient?.patientProfile?.fullName || fu.patient?.email || 'Patient'}
                        </p>
                      </div>
                      <Link href={`/app/patients/${fu.patientId || fu.patient?.id || ''}`}>
                        <Button size="sm" variant="outline">
                          Open Chart
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (1/3): Recent Patient Journey Activity & Quick Access */}
        <div className="space-y-6">
          {/* Quick Access Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => setConnectModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-teal-700" />
                  <span className="font-medium">Connect New Patient by Email</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setConsentModalOpen(true)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-teal-700" />
                  <span className="font-medium">Request Patient Record Access</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </button>

              <Link
                href="/app/patients"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-teal-700" />
                  <span className="font-medium">Connected Patients Directory</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/app/doctor/follow-ups"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-teal-700" />
                  <span className="font-medium">Manage Follow-ups</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>

              <Link
                href="/app/doctor/profile"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-700 hover:bg-teal-50/40 text-slate-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-700" />
                  <span className="font-medium">Profile & Credentials</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Recent Patient Activity */}
          <Card>
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900">
                Patient Journey Activity
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized events from your connected patient cohort.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {recentActivity.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {recentActivity.slice(0, 6).map((event) => (
                    <div key={event.id} className="p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 truncate max-w-[150px]">
                          {(event as any).patient?.patientProfile?.fullName || (event as any).patient?.email}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {formatDateTime(event.eventDate)}
                        </span>
                      </div>
                      <p className="text-slate-700 text-xs">{event.title}</p>
                      {event.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {event.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No recent patient activity recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 1. Connect with Patient Modal (Email-based connection invitation) */}
      <RequestAccessModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      {/* 2. Request Scoped Medical Record Access Modal (Connected patient dropdown) */}
      <RequestConsentModal
        isOpen={consentModalOpen}
        onClose={() => setConsentModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
        onOpenConnectPatient={() => {
          setConsentModalOpen(false);
          setConnectModalOpen(true);
        }}
      />
    </div>
  );
}
