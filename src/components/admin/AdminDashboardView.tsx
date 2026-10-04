'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { documentsApi } from '@/lib/api/documents';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate, formatCategory, formatFileSize } from '@/lib/utils';
import { ActionItemsPanel } from '@/components/ui/ActionItemsPanel';
import {
  ShieldCheck,
  Users,
  FolderLock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  RotateCcw,
  FileText,
  Activity,
  Award,
} from 'lucide-react';

export function AdminDashboardView() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Fetch Doctor Verifications
  const {
    data: verifications,
    isLoading: verificationsLoading,
  } = useQuery({
    queryKey: ['admin-doctor-verifications'],
    queryFn: () => doctorApi.listDoctorVerifications(),
  });

  // 2. Fetch Document Restore Requests
  const {
    data: restoreRequests,
    isLoading: restoreLoading,
  } = useQuery({
    queryKey: ['admin-restore-requests'],
    queryFn: () => documentsApi.getAdminRestoreRequests(),
  });

  // Quick Restore Mutation
  const restoreMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.restoreDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restore-requests'] });
    },
  });

  const pendingDoctors = (verifications || []).filter(
    (d) => d.doctorProfile?.verificationStatus === 'PENDING',
  );
  const verifiedDoctors = (verifications || []).filter(
    (d) => d.doctorProfile?.verificationStatus === 'VERIFIED',
  );
  const pendingRestores = restoreRequests || [];

  return (
    <div className="space-y-8 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Administrative & Compliance Portal
            </h1>
            <Badge variant="brand" size="sm">
              Admin Oversight
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervised governance for clinician credentials, least-privilege access boundary controls, and document vault restorations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/activity">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Activity className="h-3.5 w-3.5 text-teal-700" />}
            >
              System Audit Trail
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Pending Clinician Reviews
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {verificationsLoading ? '...' : pendingDoctors.length}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Verified Physicians
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {verificationsLoading ? '...' : verifiedDoctors.length}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-teal-50 text-teal-700">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Restore Requests
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {restoreLoading ? '...' : pendingRestores.length}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600">
              <RotateCcw className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Vault Security Boundary
              </p>
              <p className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Strict Separation
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Action Items — security alerts, new verification requests, etc. */}
      <ActionItemsPanel maxItems={4} />

      {/* Primary Action Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clinician Verification Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-teal-700" />
                Pending Doctor Verifications
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Physicians awaiting administrative review before obtaining CarePath credentialing.
              </p>
            </div>
            <Link href="/app/admin/verifications">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {verificationsLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : pendingDoctors.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                No pending physician credentials awaiting review.
              </div>
            ) : (
              pendingDoctors.slice(0, 4).map((doctor) => (
                <div key={doctor.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {doctor.doctorProfile?.fullName || 'Physician'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {doctor.doctorProfile?.specialization || 'General Medicine'} • License: {doctor.doctorProfile?.licenseNumber || doctor.doctorProfile?.registrationNumber || 'Not provided'}
                    </p>
                  </div>
                  <Link href="/app/admin/verifications">
                    <Button variant="outline" size="sm">
                      Review
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Document Restoration Queue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <RotateCcw className="h-4 w-4 text-rose-600" />
                Patient Document Restore Queue
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Archived medical records requested for restoration by patients.
              </p>
            </div>
            <Link href="/app/admin/restore-requests">
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {restoreLoading ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner size="md" />
              </div>
            ) : pendingRestores.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                No pending document restoration requests.
              </div>
            ) : (
              pendingRestores.slice(0, 4).map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {doc.document?.metadata?.reportTitle ||
                        (doc.document ? formatCategory(doc.document.category) : 'Document')}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      Patient: {doc.patient?.patientProfile?.fullName || doc.patient?.email} • Reason:{' '}
                      {doc.reason || 'Accidental deletion'}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={restoreMutation.isPending}
                    onClick={() => restoreMutation.mutate(doc.documentId || doc.id)}
                  >
                    Restore
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Governance & Architecture Card */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              HIPAA Administrative Oversight Guarantee
            </span>
            <p className="text-slate-600 leading-relaxed max-w-2xl">
              Administrative personnel can authorize clinician credentialing and approve document restorations. In accordance with Section 37 access policies, administrators do not have access to view or download raw patient medical records.
            </p>
          </div>
          <Link href="/app/activity">
            <Button variant="outline" size="sm">
              Review Security Audits
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
