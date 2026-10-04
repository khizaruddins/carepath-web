'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/lib/api/lab';
import {
  LabOrder,
  LabSample,
  LabReport,
  LabOrderStatus,
  LabSampleStatus,
} from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate, formatDateTime } from '@/lib/utils';
import { LabAccessBanner } from '@/components/lab/LabAccessBanner';
import { useLabCareConnectionByOrder } from '@/lib/hooks/use-lab-marketplace';
import {
  ClipboardList,
  User,
  Stethoscope,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Microscope,
  Home,
  Building,
  ArrowLeft,
  Plus,
  ShieldAlert,
  Edit2,
  FileText,
} from 'lucide-react';

const LIFECYCLE_STEPS: { status: LabOrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'Order Placed' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'SAMPLE_COLLECTED', label: 'Sample Collected' },
  { status: 'PROCESSING', label: 'Processing' },
  { status: 'REPORT_PENDING_REVIEW', label: 'Report Review' },
  { status: 'COMPLETED', label: 'Finalized' },
];

export default function LabOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params?.orderId as string;

  // Modals state
  const [isSampleModalOpen, setIsSampleModalOpen] = useState(false);
  const [isDraftReportOpen, setIsDraftReportOpen] = useState(false);
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [isRejectSampleOpen, setIsRejectSampleOpen] = useState<string | null>(null);

  // Forms state
  const [sampleForm, setSampleForm] = useState({
    sampleType: 'Whole Blood EDTA',
    sampleIdentifier: '',
    barcode: '',
    notes: '',
  });

  const [reportForm, setReportForm] = useState({
    testSummary: '',
    clinicalNotes: '',
    documentId: '',
  });

  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Fetch order details
  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
    refetch,
  } = useQuery({
    queryKey: ['lab-order', orderId],
    queryFn: () => labApi.getOrder(orderId),
    enabled: !!orderId,
  });

  const { data: connection } = useLabCareConnectionByOrder(orderId);

  // 2. Mutations
  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: LabOrderStatus) =>
      labApi.updateOrderStatus(orderId, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
      setSuccessMessage('Order status updated successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to update order status');
    },
  });

  const createSampleMutation = useMutation({
    mutationFn: () => labApi.createSample(orderId, sampleForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      setIsSampleModalOpen(false);
      setSampleForm({
        sampleType: 'Whole Blood EDTA',
        sampleIdentifier: '',
        barcode: '',
        notes: '',
      });
      setSuccessMessage('Specimen logged successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to log specimen');
    },
  });

  const updateSampleMutation = useMutation({
    mutationFn: ({ sampleId, status, reason }: { sampleId: string; status: LabSampleStatus; reason?: string }) =>
      labApi.updateSampleStatus(sampleId, { status, rejectionReason: reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      setIsRejectSampleOpen(null);
      setRejectionReason('');
      setSuccessMessage('Sample status updated.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to update sample status');
    },
  });

  const createDraftReportMutation = useMutation({
    mutationFn: () => labApi.createDraftReport(orderId, reportForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      setIsDraftReportOpen(false);
      setSuccessMessage('Draft report initialized.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to create draft report');
    },
  });

  const finalizeReportMutation = useMutation({
    mutationFn: (reportId: string) =>
      labApi.finalizeReport(reportId, {
        testSummary: reportForm.testSummary,
        clinicalNotes: reportForm.clinicalNotes,
        documentId: reportForm.documentId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-order', orderId] });
      setIsFinalizeModalOpen(false);
      setSuccessMessage('Report finalized and published to patient timeline.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to finalize report');
    },
  });

  if (orderLoading) {
    return <LoadingSpinner message="Loading laboratory order..." />;
  }

  if (orderError || !order) {
    return (
      <div className="max-w-4xl mx-auto space-y-4 py-8 text-left">
        <ErrorMessage
          title="Order Unavailable"
          message="This order could not be retrieved or does not belong to your laboratory."
        />
        <Button variant="outline" onClick={() => router.push('/app/lab/orders')}>
          &larr; Back to Orders Queue
        </Button>
      </div>
    );
  }

  const reports = order.reports || [];
  const activeReport = reports[0];
  const samples = order.samples || [];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      {/* Back button */}
      <div>
        <Link
          href="/app/lab/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Orders Queue</span>
        </Link>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold">&times;</button>
        </div>
      )}

      {/* Temporary Clinical Access Banner */}
      <LabAccessBanner connection={order?.labCareConnection || connection} />

      {/* 1. Order Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-slate-900">
                  {order.orderNumber}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    order.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : order.status === 'PROCESSING'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                      : order.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : order.status === 'CANCELLED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {order.status}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                    order.priority === 'STAT'
                      ? 'bg-rose-100 text-rose-800'
                      : order.priority === 'URGENT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {order.priority} Priority
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Placed on {formatDateTime(order.createdAt)} • Collection Mode:{' '}
                <strong>{order.collectionMode}</strong>
              </p>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="flex items-center gap-2">
              {order.status === 'PENDING' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate('ACCEPTED')}
                  disabled={updateStatusMutation.isPending}
                >
                  Accept Order
                </Button>
              )}
              {order.status === 'ACCEPTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate('SAMPLE_PENDING')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark Sample Pending
                </Button>
              )}
              {order.status === 'SAMPLE_COLLECTED' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateStatusMutation.mutate('PROCESSING')}
                  disabled={updateStatusMutation.isPending}
                >
                  Start Analysis
                </Button>
              )}
            </div>
          </div>

          {/* Stepper / Lifecycle Indicator */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isCurrent = order.status === step.status;
                const isCompleted =
                  LIFECYCLE_STEPS.findIndex((s) => s.status === order.status) >= idx;

                return (
                  <div
                    key={step.status}
                    className={`p-2 rounded-md border text-center transition-colors ${
                      isCurrent
                        ? 'border-teal-700 bg-teal-50 text-teal-900 font-bold'
                        : isCompleted
                        ? 'border-slate-200 bg-slate-50 text-slate-700 font-medium'
                        : 'border-slate-100 text-slate-400'
                    }`}
                  >
                    <span className="block text-[10px] uppercase tracking-wider text-slate-400">
                      Step {idx + 1}
                    </span>
                    <span className="text-xs mt-0.5 block">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Patient & Prescribing Clinician Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Minimum-Necessary Patient Demographics (Privacy Guarded) */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-teal-700" />
              <span>Patient Demographics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Full Name</span>
              <span className="text-slate-900 font-bold text-sm">
                {order.patient?.patientProfile?.fullName || 'Patient'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="text-slate-800 capitalize">
                  {order.patient?.patientProfile?.gender?.toLowerCase() || 'Unspecified'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="text-slate-800">
                  {order.patient?.patientProfile?.dateOfBirth
                    ? formatDate(order.patient.patientProfile.dateOfBirth)
                    : 'Not on file'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Contact Phone</span>
                <span className="text-slate-800">
                  {order.patient?.patientProfile?.mobile || '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="text-slate-800">
                  {order.patient?.patientProfile?.bloodGroup || 'Unknown'}
                </span>
              </div>
            </div>

            {order.collectionMode === 'HOME' && order.collectionAddress && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-400 block font-medium">Home Collection Address</span>
                <span className="text-slate-800 font-medium">{order.collectionAddress}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Prescribing Clinician Card */}
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-teal-700" />
              <span>Ordering Clinician</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            {order.prescribedDoctor ? (
              <>
                <div>
                  <span className="text-slate-400 block font-medium">Prescribing Physician</span>
                  <span className="text-slate-900 font-bold">
                    Dr. {order.prescribedDoctor.doctorProfile?.fullName || order.prescribedDoctor.email}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Medical Specialty</span>
                  <span className="text-slate-800">
                    {order.prescribedDoctor.doctorProfile?.specialization || 'General Practice'}
                  </span>
                </div>
                {order.instructions && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-slate-400 block font-medium">Clinical Instructions</span>
                    <p className="text-slate-800 mt-0.5">{order.instructions}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-500 py-4">
                This order was initiated directly by the patient for routine testing.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Requested Diagnostic Tests (Snapshotted) */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-200">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal-700" />
            <span>Diagnostic Tests ({order.items?.length || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Test Code</th>
                <th className="py-2.5 px-4">Investigation Name</th>
                <th className="py-2.5 px-4">Price Snapshot</th>
                <th className="py-2.5 px-4">Preparation Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">
                    {item.testCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {item.testName}
                  </td>
                  <td className="py-3 px-4 text-slate-800">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {item.notes || 'Standard protocol'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 4. Specimen Tracking Section */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Microscope className="h-4 w-4 text-teal-700" />
              <span>Specimen Tracking ({samples.length})</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Chain of custody and collection status</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setErrorMessage(null);
              setIsSampleModalOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Specimen</span>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {samples.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No biological specimen has been logged for this order yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Sample ID</th>
                    <th className="py-2.5 px-4">Specimen Type</th>
                    <th className="py-2.5 px-4">Barcode</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Collected At</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {samples.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {s.sampleIdentifier}
                      </td>
                      <td className="py-3 px-4 text-slate-800">{s.sampleType}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {s.barcode || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            s.status === 'COLLECTED'
                              ? 'bg-sky-50 text-sky-800 border border-sky-200'
                              : s.status === 'RECEIVED'
                              ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                              : s.status === 'REJECTED'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {s.status}
                        </span>
                        {s.rejectionReason && (
                          <div className="text-[10px] text-rose-600 mt-0.5">
                            Reason: {s.rejectionReason}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {s.collectedAt ? formatDateTime(s.collectedAt) : 'Pending'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {s.status === 'COLLECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[11px] text-indigo-700"
                              onClick={() =>
                                updateSampleMutation.mutate({
                                  sampleId: s.id,
                                  status: 'RECEIVED',
                                })
                              }
                            >
                              Mark Received
                            </Button>
                          )}
                          {s.status !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[11px] text-rose-700"
                              onClick={() => setIsRejectSampleOpen(s.id)}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 5. Diagnostic Reports Section */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-teal-700" />
              <span>Diagnostic Report Findings</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Clinical analysis summary and verified report publish</p>
          </div>

          {!activeReport && (
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setErrorMessage(null);
                setIsDraftReportOpen(true);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Draft Report</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-5">
          {!activeReport ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No diagnostic report drafted yet. Click &quot;Create Draft Report&quot; when analysis is complete.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {activeReport.reportNumber}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant={
                        activeReport.status === 'FINALIZED'
                          ? 'success'
                          : activeReport.status === 'AMENDED'
                          ? 'warning'
                          : 'neutral'
                      }
                    >
                      {activeReport.status}
                    </Badge>
                    {activeReport.isAmended && (
                      <span className="text-[11px] text-amber-700 font-semibold">
                        (Amended Version)
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/app/lab/reports/${activeReport.id}`}>
                    <Button variant="outline" size="sm" className="h-8 gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Open Workspace</span>
                    </Button>
                  </Link>

                  {activeReport.status === 'DRAFT' && (
                    <Button
                      variant="primary"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        setReportForm({
                          testSummary: activeReport.testSummary || '',
                          clinicalNotes: activeReport.clinicalNotes || '',
                          documentId: activeReport.documentId || '',
                        });
                        setIsFinalizeModalOpen(true);
                      }}
                    >
                      Finalize & Publish
                    </Button>
                  )}
                </div>
              </div>

              {activeReport.testSummary && (
                <div>
                  <span className="text-slate-400 block font-medium mb-1">
                    Diagnostic Test Summary
                  </span>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-slate-800 whitespace-pre-wrap">
                    {activeReport.testSummary}
                  </div>
                </div>
              )}

              {activeReport.clinicalNotes && (
                <div>
                  <span className="text-slate-400 block font-medium mb-1">
                    Pathologist Clinical Notes
                  </span>
                  <p className="text-slate-700">{activeReport.clinicalNotes}</p>
                </div>
              )}

              {activeReport.finalizedAt && (
                <div className="text-[11px] text-slate-400">
                  Finalized & verified on {formatDateTime(activeReport.finalizedAt)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Sample Dialog */}
      <Dialog
        isOpen={isSampleModalOpen}
        onClose={() => setIsSampleModalOpen(false)}
        title="Log Biological Specimen"
        description="Register collected specimen container, barcode, and custody timestamp."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            createSampleMutation.mutate();
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <Input
            label="Specimen Type"
            placeholder="e.g. Whole Blood EDTA, Serum, Urine"
            required
            value={sampleForm.sampleType}
            onChange={(e) => setSampleForm({ ...sampleForm, sampleType: e.target.value })}
          />

          <Input
            label="Specimen Identifier / Vial ID"
            placeholder="e.g. SMP-2026-9021"
            required
            value={sampleForm.sampleIdentifier}
            onChange={(e) => setSampleForm({ ...sampleForm, sampleIdentifier: e.target.value })}
          />

          <Input
            label="Tube Barcode Number"
            placeholder="e.g. 8901234567890"
            value={sampleForm.barcode}
            onChange={(e) => setSampleForm({ ...sampleForm, barcode: e.target.value })}
          />

          <Input
            label="Phlebotomy Notes"
            placeholder="e.g. Venipuncture completed without hemolysis"
            value={sampleForm.notes}
            onChange={(e) => setSampleForm({ ...sampleForm, notes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsSampleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createSampleMutation.isPending}>
              {createSampleMutation.isPending ? 'Logging...' : 'Save Specimen'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Reject Sample Dialog */}
      <Dialog
        isOpen={!!isRejectSampleOpen}
        onClose={() => setIsRejectSampleOpen(null)}
        title="Reject Specimen"
        description="A formal clinical reason is required when rejecting a specimen."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!isRejectSampleOpen) return;
            updateSampleMutation.mutate({
              sampleId: isRejectSampleOpen,
              status: 'REJECTED',
              reason: rejectionReason,
            });
          }}
          className="space-y-4"
        >
          <Input
            label="Rejection Reason"
            placeholder="e.g. Specimen hemolyzed / clotted / inadequate volume"
            required
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsRejectSampleOpen(null)}>
              Cancel
            </Button>
            <Button variant="destructive" type="submit" disabled={updateSampleMutation.isPending}>
              {updateSampleMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Create Draft Report Dialog */}
      <Dialog
        isOpen={isDraftReportOpen}
        onClose={() => setIsDraftReportOpen(false)}
        title="Initiate Draft Report"
        description="Draft preliminary test findings. Finalization will publish to patient timeline."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            createDraftReportMutation.mutate();
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Preliminary Test Summary
            </label>
            <textarea
              rows={4}
              placeholder="e.g. Hemoglobin: 14.2 g/dL (Normal). Platelets: 250,000 /uL (Normal)..."
              value={reportForm.testSummary}
              onChange={(e) => setReportForm({ ...reportForm, testSummary: e.target.value })}
              className="w-full text-xs rounded-md border border-slate-300 p-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
            />
          </div>

          <Input
            label="Clinical Remarks / Pathologist Notes"
            placeholder="e.g. Normal complete blood count profile."
            value={reportForm.clinicalNotes}
            onChange={(e) => setReportForm({ ...reportForm, clinicalNotes: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsDraftReportOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={createDraftReportMutation.isPending}>
              {createDraftReportMutation.isPending ? 'Creating...' : 'Save Draft Report'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Finalize Report Dialog */}
      <Dialog
        isOpen={isFinalizeModalOpen}
        onClose={() => setIsFinalizeModalOpen(false)}
        title="Finalize & Publish Diagnostic Report"
        description="Finalized reports become immutable and are projected into the longitudinal healthcare timeline."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!activeReport) return;
            setErrorMessage(null);
            finalizeReportMutation.mutate(activeReport.id);
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Final Test Summary & Results (Required)
            </label>
            <textarea
              rows={5}
              required
              value={reportForm.testSummary}
              onChange={(e) => setReportForm({ ...reportForm, testSummary: e.target.value })}
              className="w-full text-xs rounded-md border border-slate-300 p-3 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700 font-mono"
            />
          </div>

          <Input
            label="Pathologist Impression"
            value={reportForm.clinicalNotes}
            onChange={(e) => setReportForm({ ...reportForm, clinicalNotes: e.target.value })}
          />

          <Input
            label="Signed PDF Document UUID (Optional)"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440004"
            value={reportForm.documentId}
            onChange={(e) => setReportForm({ ...reportForm, documentId: e.target.value })}
          />

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
            <strong>Immutability Notice:</strong> Once finalized, results cannot be modified in place. Future changes require creating a versioned formal amendment.
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsFinalizeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={finalizeReportMutation.isPending}>
              {finalizeReportMutation.isPending ? 'Finalizing...' : 'Finalize & Publish'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
