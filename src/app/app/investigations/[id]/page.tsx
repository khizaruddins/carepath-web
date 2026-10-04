'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInvestigationDetail, useLabCareConnectionByOrder } from '@/lib/hooks/use-lab-marketplace';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate, formatDateTime } from '@/lib/utils';
import { TemporaryClinicalAccessCard } from '@/components/lab/TemporaryClinicalAccessCard';
import { ShareReportModal } from '@/components/lab/ShareReportModal';
import {
  ArrowLeft,
  FlaskConical,
  Stethoscope,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  FileText,
  Share2,
} from 'lucide-react';

export default function InvestigationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [shareModalOpen, setShareModalOpen] = useState(false);

  const {
    data: investigation,
    isLoading,
    error,
    refetch,
  } = useInvestigationDetail(id);

  // Fetch connection for the related lab order if exists
  const orderId = (investigation as any)?.labOrder?.id;
  const { data: connection, refetch: refetchConnection } = useLabCareConnectionByOrder(orderId);

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Retrieving investigation request..." />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="max-w-xl mx-auto py-12 text-left">
        <ErrorMessage
          title="Investigation Not Found"
          message="Could not load the specified investigation request details."
          onRetry={() => refetch()}
        />
        <div className="mt-4">
          <Link href="/app/investigations">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Investigations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isRequested = investigation.status === 'REQUESTED';
  const isCompleted = investigation.status === 'COMPLETED';
  const labOrder = (investigation as any)?.labOrder;

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/app/investigations">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Investigations
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {isRequested && (
            <Link href={`/app/investigations/${id}/labs`}>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Select Diagnostic Lab
              </Button>
            </Link>
          )}
          {isCompleted && labOrder?.reports?.[0] && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              leftIcon={<Share2 className="h-3.5 w-3.5 text-teal-700" />}
            >
              Share with Doctor
            </Button>
          )}
        </div>
      </div>

      {/* Main Investigation Card */}
      <Card>
        <CardHeader className="py-4 px-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-teal-700" />
              <CardTitle className="text-lg font-bold text-slate-900">
                {investigation.testName || investigation.investigationName || 'Diagnostic Test'}
              </CardTitle>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ordered on {formatDate(investigation.createdAt)} • Status:{' '}
              <strong className="text-slate-800">{investigation.status.replace('_', ' ')}</strong>
            </p>
          </div>
          <div>
            {investigation.priority && (
              <Badge
                variant={
                  investigation.priority === 'STAT'
                    ? 'error'
                    : investigation.priority === 'URGENT'
                    ? 'warning'
                    : 'neutral'
                }
                size="sm"
              >
                {investigation.priority} Priority
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6 text-xs">
          {/* Clinical Context & Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Prescribing Physician
              </span>
              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-teal-700" />
                Dr. {investigation.doctor?.user?.profile?.fullName || 'Physician'}
              </span>
              {investigation.doctor?.specialty && (
                <span className="text-slate-500 text-[11px] block">
                  {investigation.doctor.specialty}
                </span>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Clinical Reason &amp; Indication
              </span>
              <span className="text-slate-800 font-medium block">
                {investigation.clinicalReason || 'Standard clinical diagnostic evaluation'}
              </span>
            </div>
          </div>

          {investigation.instructions && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950">
              <span className="font-bold block text-xs mb-1">
                Patient Preparation &amp; Instructions:
              </span>
              <p className="text-[11px] leading-relaxed text-amber-900">
                {investigation.instructions}
              </p>
            </div>
          )}

          {/* Action Needed Banner if not yet selected */}
          {isRequested && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-teal-950">
              <div className="space-y-0.5">
                <span className="font-bold text-teal-900 text-sm block">
                  Step 2: Choose a Diagnostic Center
                </span>
                <p className="text-teal-800 text-[11px]">
                  Explore accredited pathology labs, compare transparent prices, and book home collection or branch visits.
                </p>
              </div>
              <Link href={`/app/investigations/${id}/labs`} className="shrink-0">
                <Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
                  Compare Nearby Labs
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Order Tracking & Fulfillment (If Order Created) */}
      {labOrder && (
        <Card>
          <CardHeader className="py-3 px-6 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-700" />
              <span>Diagnostic Center &amp; Order Fulfillment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Diagnostic Center
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {labOrder.lab?.name || 'Diagnostic Laboratory'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Collection Mode
                </span>
                <span className="font-semibold text-slate-800">
                  {labOrder.collectionMode === 'HOME_COLLECTION'
                    ? 'Home Phlebotomy Collection'
                    : 'Facility Visit'}
                </span>
                {labOrder.collectionAddress && (
                  <span className="block text-[11px] text-slate-500 mt-0.5">
                    {labOrder.collectionAddress}
                  </span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Order Status
                </span>
                <Badge variant="brand" size="sm" dot>
                  {labOrder.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Reports list if any */}
            {labOrder.reports && labOrder.reports.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <span className="font-semibold text-slate-800 block mb-2">
                  Diagnostic Test Reports
                </span>
                <div className="space-y-2">
                  {labOrder.reports.map((rep: any) => (
                    <div
                      key={rep.id}
                      className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {rep.testSummary || 'Final Report'}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            Released on {formatDateTime(rep.releasedAt || rep.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rep.documentId && (
                          <Link href={`/app/documents/${rep.documentId}`}>
                            <Button variant="outline" size="sm" leftIcon={<FileText className="h-3.5 w-3.5" />}>
                              View in Vault
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShareModalOpen(true)}
                          leftIcon={<Share2 className="h-3.5 w-3.5" />}
                        >
                          Share with Doctor
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Temporary Clinical Access Card */}
      {connection && (
        <TemporaryClinicalAccessCard
          connection={connection}
          onRevoked={() => {
            refetch();
            refetchConnection();
          }}
        />
      )}

      {/* Share Report Modal */}
      {labOrder?.reports?.[0] && (
        <ShareReportModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          reportId={labOrder.reports[0].id}
          reportTitle={investigation.testName || investigation.investigationName || 'Diagnostic Report'}
          prescribedDoctorId={investigation.doctorId}
          prescribedDoctorName={investigation.doctor?.user?.profile?.fullName}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
}
