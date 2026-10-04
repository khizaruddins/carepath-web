'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/lib/api/lab';
import { LabReport, LabReportStatus } from '@/lib/api/types';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Clock,
  ShieldCheck,
  History,
  Lock,
  ExternalLink,
  Edit3,
} from 'lucide-react';

export default function LabReportDetailPage() {
  const params = useParams();
  const reportId = params?.reportId as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isDoctor = user?.role === 'DOCTOR';
  const isLab = user?.role === 'LAB';

  // Amendment modal state
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [amendedReason, setAmendedReason] = useState('');
  const [amendedSummary, setAmendedSummary] = useState('');
  const [amendedNotes, setAmendedNotes] = useState('');

  // Finalize modal state
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalSummary, setFinalSummary] = useState('');
  const [finalNotes, setFinalNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: report,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['lab-report', reportId],
    queryFn: () => labApi.getReport(reportId),
    enabled: !!reportId,
  });

  const finalizeMutation = useMutation({
    mutationFn: () => {
      if (!finalSummary.trim()) throw new Error('Test summary findings are required to finalize.');
      return labApi.finalizeReport(reportId, {
        testSummary: finalSummary.trim(),
        clinicalNotes: finalNotes.trim() || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-report', reportId] });
      setShowFinalizeModal(false);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to finalize lab report');
    },
  });

  const amendMutation = useMutation({
    mutationFn: () => {
      if (!amendedReason.trim()) throw new Error('A reason for clinical amendment is strictly required.');
      if (!amendedSummary.trim()) throw new Error('Amended test summary is required.');
      return labApi.amendReport(reportId, {
        amendedReason: amendedReason.trim(),
        testSummary: amendedSummary.trim(),
        clinicalNotes: amendedNotes.trim() || undefined,
      });
    },
    onSuccess: (newReport) => {
      setShowAmendModal(false);
      setErrorMessage(null);
      // Navigate to the newly created amended version
      router.push(`/app/lab/reports/${newReport.id}`);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to issue report amendment');
    },
  });

  const getStatusBadge = (status: LabReportStatus) => {
    switch (status) {
      case 'FINALIZED':
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Finalized & Verified
          </Badge>
        );
      case 'AMENDED':
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            <History className="h-3.5 w-3.5" /> Amended (Superseded)
          </Badge>
        );
      case 'DRAFT':
      default:
        return (
          <Badge variant="neutral" className="gap-1 font-semibold">
            <Clock className="h-3.5 w-3.5" /> Preliminary Draft
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-3 text-xs text-text-muted">Loading laboratory diagnostic report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-4">
        <Link
          href="/app/lab/orders"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <ErrorMessage
          message="Failed to load diagnostic report. It may have been restricted or removed."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const isFinalOrAmended = report.status === 'FINALIZED' || report.status === 'AMENDED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          {report.orderId && (
            <Link
              href={`/app/lab/orders/${report.orderId}`}
              className="text-xs text-brand hover:underline font-medium inline-flex items-center gap-1"
            >
              View Associated Lab Order <ExternalLink className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2">
                <FileText className="h-6 w-6 text-brand" />
                Report {report.reportNumber}
              </h1>
              {getStatusBadge(report.status)}
            </div>
            <p className="text-xs text-text-muted mt-1">
              Diagnostic Pathology & Laboratory Evaluation Record
            </p>
          </div>

          {/* Action buttons for Lab Personnel */}
          {isLab && (
            <div className="flex items-center gap-2">
              {report.status === 'DRAFT' && (
                <Button
                  size="sm"
                  variant="primary"
                  className="gap-1.5"
                  onClick={() => {
                    setFinalSummary(report.testSummary || '');
                    setFinalNotes(report.clinicalNotes || '');
                    setShowFinalizeModal(true);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Finalize & Publish
                </Button>
              )}
              {report.status === 'FINALIZED' && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                  onClick={() => {
                    setAmendedReason('');
                    setAmendedSummary(report.testSummary || '');
                    setAmendedNotes(report.clinicalNotes || '');
                    setShowAmendModal(true);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Issue Formal Amendment
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clinician View-Only Banner (Doctors cannot download reports) */}
      {isDoctor && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
          <Lock className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold">Clinician View-Only Access:</strong> Pursuant to
            CarePath data governance protocols, physicians possess read-only audit privileges for
            laboratory diagnostic reports. Document downloads are restricted to verified patients
            and issuing laboratories.
          </div>
        </div>
      )}

      {/* Amendment Notice Banner if Report has been Amended or has a Predecessor */}
      {report.previousReportId && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md text-xs space-y-1">
          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
            <History className="h-4 w-4" />
            This is an Amended Diagnostic Report
          </div>
          <p className="text-blue-800 dark:text-blue-300">
            <strong>Clinical Justification for Amendment:</strong> {report.amendedReason || 'Not stated'}
          </p>
          <div className="pt-1">
            <Link
              href={`/app/lab/reports/${report.previousReportId}`}
              className="text-brand font-medium underline inline-flex items-center gap-1"
            >
              Inspect superseded predecessor report <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Report Document Sheet */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b border-border bg-surface-secondary/40 py-4 px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-text-muted">Issuing Laboratory:</span>{' '}
              <strong className="text-text">{report.lab?.name || 'CarePath Diagnostic Network'}</strong>
              {report.lab?.licenseNumber && (
                <span className="text-text-muted ml-2 font-mono">
                  (Lic: {report.lab.licenseNumber})
                </span>
              )}
            </div>
            <div className="text-text-muted">
              Report Generated: <span className="text-text font-medium">{formatDate(report.createdAt)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-surface-secondary rounded-md text-xs border border-border">
            <div>
              <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">
                Report Identifier
              </span>
              <span className="font-mono font-medium text-text mt-0.5 block">
                {report.reportNumber}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">
                Verification State
              </span>
              <span className="font-medium text-text mt-0.5 block">
                {report.status === 'FINALIZED' ? 'Validated & Finalized' : report.status}
              </span>
            </div>
            <div>
              <span className="text-text-muted block text-[11px] uppercase tracking-wider font-semibold">
                Sign-off Timestamp
              </span>
              <span className="font-medium text-text mt-0.5 block">
                {report.finalizedAt ? formatDate(report.finalizedAt) : 'Pending Review'}
              </span>
            </div>
          </div>

          {/* Diagnostic Test Summary Findings */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-brand" />
              Diagnostic Findings & Test Summary
            </h3>
            <div className="p-4 bg-surface border border-border rounded-md text-xs text-text leading-relaxed whitespace-pre-wrap font-sans">
              {report.testSummary || (
                <span className="text-text-muted italic">
                  No summary findings recorded yet. Preliminary draft status.
                </span>
              )}
            </div>
          </div>

          {/* Clinical Notes & Observations */}
          <div>
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              Clinical Pathologist Notes & Remarks
            </h3>
            <div className="p-4 bg-surface border border-border rounded-md text-xs text-text leading-relaxed whitespace-pre-wrap font-sans">
              {report.clinicalNotes || (
                <span className="text-text-muted italic">No pathologist notes recorded.</span>
              )}
            </div>
          </div>

          {/* Attached Signed Document Link (if present) */}
          {report.documentId && (
            <div className="p-4 border border-border rounded-md flex items-center justify-between text-xs bg-surface-secondary/20">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-brand" />
                <div>
                  <span className="font-medium text-text">Attached Formal Diagnostic Report PDF</span>
                  <span className="text-[11px] text-text-muted block">
                    Document Vault Reference: {report.documentId}
                  </span>
                </div>
              </div>

              {!isDoctor ? (
                <Link
                  href={`/app/documents/${report.documentId}`}
                  className="text-xs font-medium text-brand hover:underline flex items-center gap-1"
                >
                  View Document <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="text-[11px] text-text-muted italic">
                  View-only clinician audit mode
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finalize Modal */}
      <Dialog
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        title="Finalize Diagnostic Report"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-text-muted">
            Finalizing will publish the report to the patient and ordering clinician. Once finalized,
            the contents cannot be edited directly; any changes will require a formal amendment.
          </p>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Diagnostic Findings & Test Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={finalSummary}
              onChange={(e) => setFinalSummary(e.target.value)}
              placeholder="Enter final quantitative and qualitative diagnostic findings..."
              rows={4}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Pathologist / Reviewer Clinical Notes (Optional)
            </label>
            <textarea
              value={finalNotes}
              onChange={(e) => setFinalNotes(e.target.value)}
              placeholder="Clinical remarks, reference ranges, or recommendations..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowFinalizeModal(false)}
              disabled={finalizeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => finalizeMutation.mutate()}
              isLoading={finalizeMutation.isPending}
            >
              Confirm & Finalize
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Formal Amendment Modal */}
      <Dialog
        isOpen={showAmendModal}
        onClose={() => setShowAmendModal(false)}
        title="Issue Formal Report Amendment"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-text-muted">
            Issuing an amendment creates a versioned successor report and flags the current report as
            superseded. A formal clinical justification is strictly required.
          </p>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Clinical Justification for Amendment <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={amendedReason}
              onChange={(e) => setAmendedReason(e.target.value)}
              placeholder="State reason for amendment (e.g., Re-tested specimen, corrected reference range)..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Amended Findings & Test Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={amendedSummary}
              onChange={(e) => setAmendedSummary(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Amended Pathologist Clinical Notes (Optional)
            </label>
            <textarea
              value={amendedNotes}
              onChange={(e) => setAmendedNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAmendModal(false)}
              disabled={amendMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => amendMutation.mutate()}
              isLoading={amendMutation.isPending}
            >
              Publish Amendment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
