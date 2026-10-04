'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { DocumentRestoreRequestItem, RestoreRequestStatus } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate, formatCategory, formatFileSize } from '@/lib/utils';
import {
  RotateCcw,
  CheckCircle2,
  FileText,
  ArrowLeft,
  AlertTriangle,
  User,
  Calendar,
  XCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export default function DocumentRestoreRequestsPage() {
  const queryClient = useQueryClient();
  const [selectedReq, setSelectedReq] = useState<DocumentRestoreRequestItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: restoreRequests,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-restore-requests', statusFilter],
    queryFn: () => documentsApi.getAdminRestoreRequests(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!selectedReq || !actionType) throw new Error('No request selected');
      return documentsApi.reviewDocumentRestore(
        selectedReq.id,
        actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        adminNotes.trim() || undefined,
        actionType === 'REJECT' ? rejectionReason.trim() || 'Restoration declined by administrator' : undefined,
      );
    },
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      closeModal();
      queryClient.invalidateQueries({ queryKey: ['admin-restore-requests'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to process restoration request');
    },
  });

  const openModal = (req: DocumentRestoreRequestItem, action: 'APPROVE' | 'REJECT') => {
    setSelectedReq(req);
    setActionType(action);
    setAdminNotes('');
    setRejectionReason('');
    setErrorMessage(null);
  };

  const closeModal = () => {
    setSelectedReq(null);
    setActionType(null);
    setAdminNotes('');
    setRejectionReason('');
    setErrorMessage(null);
  };

  const getStatusBadge = (status: RestoreRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge variant="warning" size="sm" dot>
            Pending Review
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge variant="success" size="sm" dot>
            Restored to Vault
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="error" size="sm" dot>
            Declined
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="neutral" size="sm">
            Cancelled by Patient
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/app/dashboard">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Document Restoration Queue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervised recovery of accidentally deleted medical records requested by patients.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage
          message={(error as any)?.message || 'Failed to load restoration requests'}
          onRetry={() => refetch()}
        />
      ) : !restoreRequests || restoreRequests.length === 0 ? (
        <Card className="py-12 text-center text-xs text-slate-500">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} restoration tickets found</p>
          <p className="mt-1">All patient records in this queue have been processed or none are pending.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {restoreRequests.map((req) => {
            const doc = req.document;
            const version = doc?.versions?.[0];

            return (
              <Card key={req.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${
                      req.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        {doc?.metadata?.reportTitle || (doc ? formatCategory(doc.category) : 'Medical Document')}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Category: {doc ? formatCategory(doc.category) : 'Document'} • Requested:{' '}
                        {formatDate(req.createdAt)}
                      </p>
                    </div>
                  </div>

                  {getStatusBadge(req.status)}
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Patient Information
                      </span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {req.patient?.patientProfile?.fullName || 'Patient'}
                      </p>
                      <p className="text-[11px] text-slate-500">{req.patient?.email}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        File Details
                      </span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {version?.originalFileName || 'Medical Document'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {version?.fileSizeBytes ? formatFileSize(version.fileSizeBytes) : 'Preserved in Vault'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Request Timestamp
                      </span>
                      <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(req.createdAt)}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {req.reviewedAt ? `Reviewed ${formatDate(req.reviewedAt)}` : 'Awaiting admin decision'}
                      </p>
                    </div>
                  </div>

                  {/* Patient's Restoration Reason */}
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-xs text-amber-900">
                    <span className="font-semibold block mb-0.5">Patient&apos;s Restoration Reason:</span>
                    <p className="leading-relaxed">
                      {req.reason || 'Accidentally archived this record. Please restore to my health vault.'}
                    </p>
                  </div>

                  {/* Admin Rejection Reason if any */}
                  {req.rejectionReason && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                      <span className="font-semibold block mb-0.5">Administrative Rejection Reason:</span>
                      <p className="leading-relaxed">{req.rejectionReason}</p>
                    </div>
                  )}

                  {/* Actions for PENDING */}
                  {req.status === 'PENDING' && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-700 hover:bg-rose-50"
                        leftIcon={<XCircle className="h-3.5 w-3.5" />}
                        onClick={() => openModal(req, 'REJECT')}
                      >
                        Decline Request
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        onClick={() => openModal(req, 'APPROVE')}
                      >
                        Approve & Restore to Vault
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation & Review Modal */}
      {selectedReq && actionType && (
        <Dialog
          isOpen={true}
          onClose={closeModal}
          title={actionType === 'APPROVE' ? 'Approve Document Restoration' : 'Decline Restoration Request'}
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              {actionType === 'APPROVE' ? (
                <>
                  Confirm restoring{' '}
                  <strong className="text-slate-900">
                    {selectedReq.document?.metadata?.reportTitle ||
                      (selectedReq.document ? formatCategory(selectedReq.document.category) : 'document')}
                  </strong>{' '}
                  to{' '}
                  <strong className="text-slate-900">
                    {selectedReq.patient?.patientProfile?.fullName || selectedReq.patient?.email}
                  </strong>
                  &apos;s active health vault?
                </>
              ) : (
                <>
                  Are you sure you want to decline the restoration request for{' '}
                  <strong className="text-slate-900">
                    {selectedReq.document?.metadata?.reportTitle || 'this document'}
                  </strong>
                  ? The document will remain soft-deleted in the patient&apos;s archive.
                </>
              )}
            </p>

            {actionType === 'REJECT' && (
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this document cannot be restored..."
                  rows={3}
                  className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:border-rose-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Internal Administrative Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Log internal context or audit reference notes..."
                rows={2}
                className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'APPROVE' ? 'primary' : 'destructive'}
                size="sm"
                isLoading={reviewMutation.isPending}
                disabled={actionType === 'REJECT' && !rejectionReason.trim()}
                onClick={() => reviewMutation.mutate()}
              >
                {actionType === 'APPROVE' ? 'Confirm & Restore' : 'Decline Request'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
