'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { doctorApi } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { DocumentCategory, MedicalDocument } from '@/lib/api/types';
import { formatDate, formatDateTime, formatCategory, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  ArrowLeft,
  Download,
  Edit2,
  Trash2,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Lock,
  ExternalLink,
  Stethoscope,
  Send,
  KeyRound,
  Share2,
} from 'lucide-react';
import { ShareReportModal } from '@/components/lab/ShareReportModal';

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const id = params?.id as string;

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Clinician feedback state
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackRecommendations, setFeedbackRecommendations] = useState('');

  // Edit form state
  const [editCategory, setEditCategory] = useState<DocumentCategory>('LAB_REPORT');
  const [editTitle, setEditTitle] = useState('');
  const [editProvider, setEditProvider] = useState('');
  const [editFacility, setEditFacility] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editConfirmed, setEditConfirmed] = useState(false);

  // Fetch Document by ID (generates short-lived signed URL & audits view)
  const {
    data: document,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['document', id],
    queryFn: () => documentsApi.getDocumentById(id),
    enabled: !!id,
  });

  // Fetch Clinician Feedback for this Document
  const { data: feedbacks, refetch: refetchFeedbacks } = useQuery({
    queryKey: ['document-feedbacks', id],
    queryFn: () => doctorApi.getDocumentFeedback(id),
    enabled: !!id,
  });

  // Populate edit fields when opened
  const handleOpenEdit = () => {
    if (document) {
      setEditCategory(document.category);
      setEditTitle(document.metadata?.reportTitle || '');
      setEditProvider(document.metadata?.providerName || '');
      setEditFacility(document.metadata?.facility || '');
      setEditDate(
        document.metadata?.documentDate ? document.metadata.documentDate.split('T')[0] : '',
      );
      setEditNotes(document.metadata?.patientNotes || '');
      setEditConfirmed(document.metadata?.isPatientConfirmed || false);
      setEditModalOpen(true);
    }
  };

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      documentsApi.updateDocument(id, {
        category: editCategory,
        reportTitle: editTitle || undefined,
        providerName: editProvider || undefined,
        facility: editFacility || undefined,
        documentDate: editDate || undefined,
        patientNotes: editNotes || undefined,
        isPatientConfirmed: editConfirmed,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document', id] });
      queryClient.invalidateQueries({ queryKey: ['documents-list'] });
      setEditModalOpen(false);
    },
  });

  // Delete / Archive Mutation
  const deleteMutation = useMutation({
    mutationFn: () => documentsApi.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-list'] });
      router.push('/app/documents');
    },
  });

  // Add Clinician Feedback Mutation
  const addFeedbackMutation = useMutation({
    mutationFn: () =>
      doctorApi.addDoctorFeedback(id, feedbackNotes, feedbackRecommendations || undefined),
    onSuccess: () => {
      refetchFeedbacks();
      setFeedbackNotes('');
      setFeedbackRecommendations('');
      setFeedbackModalOpen(false);
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Verifying access and generating signed URL..." />;
  }

  if (error || !document) {
    const isForbidden = (error as any)?.response?.status === 403 || (error as any)?.status === 403;
    return (
      <div className="max-w-2xl mx-auto py-12 text-left space-y-4">
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-900 font-bold">
            <Lock className="h-5 w-5 text-amber-700" />
            <h2 className="text-base">Access Restricted by Patient Consent Policy</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {isForbidden
              ? 'This document is protected by CarePath zero-presumed-access security. Your active consent grant does not cover this specific category or document, or the authorization window has expired.'
              : ((error as any)?.message || 'You do not have permission to view this medical record or it has been removed.')}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href={user?.role === 'DOCTOR' ? '/app/doctor/reports' : '/app/documents'}>
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
                {user?.role === 'DOCTOR' ? 'Back to Patient Reports' : 'Back to My Documents'}
              </Button>
            </Link>
            {user?.role === 'DOCTOR' && (
              <Link href="/app/doctor/requests">
                <Button variant="primary" size="sm" leftIcon={<KeyRound className="h-3.5 w-3.5" />}>
                  Request Patient Consent
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const latestVersion = document.versions?.[0];
  const metadata = document.metadata;
  const isImage = latestVersion?.mimeType?.startsWith('image/');
  const isPdf = latestVersion?.mimeType === 'application/pdf';

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/documents"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Back to documents list"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {metadata?.reportTitle || formatCategory(document.category)}
              </h1>
              {metadata?.isPatientConfirmed ? (
                <Badge variant="success" size="sm" dot>
                  Patient Confirmed
                </Badge>
              ) : (
                <Badge variant="warning" size="sm" dot>
                  Needs Review
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Category: {formatCategory(document.category)} • Recorded:{' '}
              {formatDate(metadata?.documentDate || document.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Patients are permitted to download records; clinicians are prohibited from downloading (view-only vault policy) */}
          {user?.role === 'PATIENT' && document.signedUrl && (
            <a
              href={document.signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={latestVersion?.originalFileName}
            >
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                Download Record
              </Button>
            </a>
          )}
          {user?.role === 'DOCTOR' && (
            <>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200">
                <Lock className="h-3.5 w-3.5 text-amber-700" />
                <span>View-Only • Downloads Prohibited</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFeedbackModalOpen(true)}
                leftIcon={<Stethoscope className="h-3.5 w-3.5 text-teal-700" />}
              >
                Provide Clinical Feedback
              </Button>
            </>
          )}
          {user?.role === 'PATIENT' && (
            <>
              {document.category === 'LAB_REPORT' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShareModalOpen(true)}
                  leftIcon={<Share2 className="h-3.5 w-3.5 text-teal-700" />}
                >
                  Share with Doctor
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenEdit}
                leftIcon={<Edit2 className="h-3.5 w-3.5" />}
              >
                Edit Metadata
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-800"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
              >
                Archive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Clinician View-Only Compliance Banner */}
      {user?.role === 'DOCTOR' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-amber-100/80 text-amber-800 shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-950">View-only access</p>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Downloading or exporting this patient record is restricted for clinician access.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-[10px] font-medium border border-amber-300">
            Minimum-Necessary Access Policy
          </span>
        </div>
      )}

      {/* Main Grid: Preview & Metadata Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Document Preview & OCR Findings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document File Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Document Preview</CardTitle>
              <span className="text-[11px] text-slate-400">
                {user?.role === 'DOCTOR' ? 'View-Only Clinical Vault' : 'Signed Token (Expires in 15 mins)'}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-slate-100 min-h-[360px] flex items-center justify-center p-4">
                {document.signedUrl ? (
                  isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={document.signedUrl}
                      alt={metadata?.reportTitle || 'Medical scan'}
                      className="max-h-[500px] object-contain rounded border border-slate-200 shadow-xs"
                    />
                  ) : isPdf ? (
                    <div className="w-full space-y-3 text-center">
                      <iframe
                        src={document.signedUrl}
                        className="w-full h-[450px] rounded border border-slate-200 bg-white"
                        title="Medical PDF Document"
                      />
                      <p className="text-[11px] text-slate-500">
                        Viewing protected PDF via ephemeral signed token.
                      </p>
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-2">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-700">
                        {latestVersion?.originalFileName}
                      </p>
                      <a href={document.signedUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="mt-2">
                          Open in New Tab
                        </Button>
                      </a>
                    </div>
                  )
                ) : user?.role === 'DOCTOR' || document.downloadProhibited ? (
                  <div className="text-center p-8 space-y-3 max-w-md mx-auto">
                    <div className="h-12 w-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800">
                        View-Only Clinical Mode
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Downloading or exporting this patient record is restricted for clinician access. Structured OCR clinical parameters, laboratory values, and findings are accessible below.
                      </p>
                    </div>
                    <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-900 border-amber-300">
                      Minimum-Necessary Policy
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Lock className="h-8 w-8 text-slate-400 mx-auto" />
                    <p className="text-xs text-slate-500">
                      Signed URL expired or unavailable. Refresh to re-authenticate access.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                      Refresh Access Token
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Structured Parameters Extracted by OCR */}
          {metadata?.extractedData?.parameters && metadata.extractedData.parameters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Structured Laboratory Parameters</CardTitle>
                <p className="text-xs text-slate-500">
                  Extracted from diagnostic report text and verified.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {metadata.extractedData.parameters.map((param, index) => (
                    <div key={index} className="p-3.5 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{param.name}</span>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {param.value} {param.unit || ''}
                        </span>
                        {param.referenceRange && (
                          <span className="text-[11px] text-slate-400 block">
                            Ref: {param.referenceRange}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Raw Extracted OCR Text Toggle */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-teal-700" />
                <span>Extracted OCR Data (Separated Storage)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowRawOcr(!showRawOcr)}
                className="text-xs text-teal-800 font-semibold hover:underline"
              >
                {showRawOcr ? 'Hide raw text' : 'Inspect raw text'}
              </button>
            </div>
            {showRawOcr && (
              <pre className="p-3 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-700 whitespace-pre-wrap font-mono max-h-60 overflow-y-auto">
                {metadata?.rawOcrText || 'No raw OCR text recorded.'}
              </pre>
            )}
          </div>

          {/* Clinician Feedback & Medical Notes Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-teal-700" />
                  Clinician Feedback & Medical Assessments
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Professional observations and recommendations provided by verified physicians.
                </p>
              </div>
              {user?.role === 'DOCTOR' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setFeedbackModalOpen(true)}
                  leftIcon={<Stethoscope className="h-3.5 w-3.5 text-teal-700" />}
                >
                  Add Assessment
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {feedbacks && feedbacks.length > 0 ? (
                <div className="space-y-4">
                  {feedbacks.map((fb) => (
                    <div
                      key={fb.id}
                      className="p-4 rounded-lg border border-teal-100 bg-teal-50/30 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-teal-100/60 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            Dr. {fb.doctor.doctorProfile?.fullName || 'Physician'}
                          </span>
                          {fb.doctor.doctorProfile?.specialization && (
                            <Badge variant="neutral" size="sm">
                              {fb.doctor.doctorProfile.specialization}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {formatDateTime(fb.createdAt)}
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="font-medium text-slate-700 block mb-1">
                          Clinical Observations:
                        </span>
                        <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {fb.notes}
                        </p>
                      </div>

                      {fb.recommendations && (
                        <div className="mt-2 pt-2 border-t border-teal-100/60">
                          <span className="font-medium text-teal-900 block mb-1">
                            Recommended Next Steps / Care Guidance:
                          </span>
                          <p className="text-teal-900 bg-teal-50 p-2.5 rounded border border-teal-200/50 whitespace-pre-wrap font-medium">
                            {fb.recommendations}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No clinician assessments recorded for this document yet.
                  {user?.role === 'DOCTOR' && (
                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setFeedbackModalOpen(true)}
                        leftIcon={<Stethoscope className="h-3.5 w-3.5 text-teal-700" />}
                      >
                        Provide First Clinical Feedback
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1/3): Structured Metadata & Security Verification */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Record Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-slate-900">
                  {formatCategory(document.category)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Document Date</span>
                <span className="font-medium text-slate-800">
                  {formatDate(metadata?.documentDate)}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Provider / Specialist</span>
                <span className="font-medium text-slate-800">
                  {metadata?.providerName || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Facility / Clinic</span>
                <span className="font-medium text-slate-800">
                  {metadata?.facility || 'Not specified'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Uploaded Timestamp</span>
                <span className="font-medium text-slate-800">
                  {formatDateTime(document.createdAt)}
                </span>
              </div>

              {metadata?.patientNotes && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px] mb-1">Patient Notes</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {metadata.patientNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Physical File Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Storage & Integrity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">File Name:</span>
                <span className="font-medium text-slate-800 truncate max-w-[150px]">
                  {latestVersion?.originalFileName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">MIME Type:</span>
                <span className="font-medium text-slate-800">{latestVersion?.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">File Size:</span>
                <span className="font-medium text-slate-800">
                  {formatFileSize(latestVersion?.fileSizeBytes)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-teal-800">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-medium">Virus scan passed • Clean</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Metadata Dialog */}
      <Dialog
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Document Metadata"
        description="Correct or confirm details for this medical record."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <Select
            label="Category"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value as DocumentCategory)}
            options={[
              { label: 'Lab Report', value: 'LAB_REPORT' },
              { label: 'Prescription', value: 'PRESCRIPTION' },
              { label: 'Consultation Note', value: 'CONSULTATION' },
              { label: 'Discharge Summary', value: 'DISCHARGE_SUMMARY' },
              { label: 'Imaging Report', value: 'IMAGING_REPORT' },
              { label: 'X-Ray Scan', value: 'XRAY' },
              { label: 'CT Scan', value: 'CT' },
              { label: 'MRI Scan', value: 'MRI' },
              { label: 'Other Record', value: 'OTHER' },
            ]}
          />

          <Input
            label="Report Title"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Provider Name"
              value={editProvider}
              onChange={(e) => setEditProvider(e.target.value)}
            />
            <Input
              label="Facility"
              value={editFacility}
              onChange={(e) => setEditFacility(e.target.value)}
            />
          </div>

          <Input
            label="Document Date"
            type="date"
            value={editDate}
            onChange={(e) => setEditDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Notes
            </label>
            <textarea
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="confirm-ocr-checkbox"
              checked={editConfirmed}
              onChange={(e) => setEditConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
            />
            <label htmlFor="confirm-ocr-checkbox" className="text-xs text-slate-800 font-medium">
              I have reviewed and confirmed the details of this medical record.
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={updateMutation.isPending}
              onClick={() => updateMutation.mutate()}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Delete / Archive Confirmation Dialog */}
      <Dialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Archive Medical Document"
        description="Are you sure you want to archive this document from your active vault?"
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            This document will be archived. You can always retrieve archived documents through your
            administrative audit logs.
          </p>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Confirm Archive
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Clinician Feedback Modal Dialog */}
      <Dialog
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title="Add Clinician Feedback & Recommendations"
        description="Submit professional clinical guidance. Note that original patient records remain completely unmodified."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Assessment & Observations *
            </label>
            <textarea
              rows={4}
              required
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Record clinical interpretation, lab evaluation, diagnostic context..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Next Steps & Guidance for Patient (Optional)
            </label>
            <textarea
              rows={3}
              value={feedbackRecommendations}
              onChange={(e) => setFeedbackRecommendations(e.target.value)}
              placeholder="e.g., Repeat fasting glucose in 3 months; schedule endocrinology follow-up..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!feedbackNotes.trim()}
              isLoading={addFeedbackMutation.isPending}
              onClick={() => addFeedbackMutation.mutate()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Share Report with Doctor Modal */}
      {document?.id && (
        <ShareReportModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          reportId={document.id}
          reportTitle={document.metadata?.reportTitle || 'Diagnostic Laboratory Report'}
          prescribedDoctorId={document.metadata?.prescribedDoctorId}
          prescribedDoctorName={document.metadata?.providerName}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['consents'] });
          }}
        />
      )}
    </div>
  );
}
