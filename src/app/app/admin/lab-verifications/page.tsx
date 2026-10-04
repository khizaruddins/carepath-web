'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi } from '@/lib/api/lab';
import { LabOrganization, LabVerificationStatus } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Search,
  FileText,
  Phone,
  Mail,
  MapPin,
  PauseCircle,
} from 'lucide-react';

export default function LabVerificationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Review modal state
  const [selectedLab, setSelectedLab] = useState<LabOrganization | null>(null);
  const [reviewAction, setReviewAction] = useState<LabVerificationStatus | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: labs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-lab-verifications', statusFilter],
    queryFn: () =>
      labApi.listVerifications(
        statusFilter !== 'ALL' ? (statusFilter as LabVerificationStatus) : undefined,
      ),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!selectedLab || !reviewAction) throw new Error('No laboratory selected');
      if (reviewAction === 'REJECTED' && !notes.trim()) {
        throw new Error('A reason is strictly required when rejecting a laboratory facility.');
      }
      return labApi.reviewVerification(selectedLab.id, {
        status: reviewAction,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      setSuccessMessage(`Laboratory verification successfully updated to ${reviewAction}.`);
      queryClient.invalidateQueries({ queryKey: ['admin-lab-verifications'] });
      closeReviewModal();
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update laboratory verification status');
    },
  });

  const openReviewModal = (lab: LabOrganization, action: LabVerificationStatus) => {
    setSelectedLab(lab);
    setReviewAction(action);
    setNotes('');
    setErrorMessage(null);
  };

  const closeReviewModal = () => {
    setSelectedLab(null);
    setReviewAction(null);
    setNotes('');
    setErrorMessage(null);
  };

  const filteredLabs = (labs || []).filter((lab) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = lab.name.toLowerCase().includes(q);
      const matchLicense = lab.licenseNumber.toLowerCase().includes(q);
      const matchCity = lab.city?.toLowerCase().includes(q);
      const matchEmail = lab.contactEmail.toLowerCase().includes(q);
      if (!matchName && !matchLicense && !matchCity && !matchEmail) {
        return false;
      }
    }
    return true;
  });

  const getStatusBadge = (status: LabVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            <CheckCircle2 className="h-3 w-3" /> Verified
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="error" className="gap-1 font-semibold">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant="error" className="gap-1 font-semibold">
            <PauseCircle className="h-3 w-3" /> Suspended
          </Badge>
        );
      case 'PENDING':
      default:
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Header */}
      <div>
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-brand" />
              Laboratory Verifications
            </h1>
            <p className="text-xs text-text-muted mt-1">
              CarePath Administrative Credentialing & Diagnostic Facility Verification Desk
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-xs py-1 px-2.5">
              {filteredLabs.length} Facilities Found
            </Badge>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-md flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: 'All Facilities', value: 'ALL' },
                { label: 'Pending Review', value: 'PENDING' },
                { label: 'Verified', value: 'VERIFIED' },
                { label: 'Rejected', value: 'REJECTED' },
                { label: 'Suspended', value: 'SUSPENDED' },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => setStatusFilter(item.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    statusFilter === item.value
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-surface-secondary text-text-muted hover:text-text hover:bg-surface-secondary/80'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, license, city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Laboratory Listings */}
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-3 text-xs text-text-muted">Loading laboratory credentialing records...</p>
        </div>
      ) : error ? (
        <ErrorMessage
          message="Failed to load laboratory verifications. Ensure administrative privileges are active."
          onRetry={() => refetch()}
        />
      ) : filteredLabs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Building2 className="h-10 w-10 text-text-muted/40 mb-3" />
            <h3 className="text-sm font-semibold text-text">No laboratories found</h3>
            <p className="text-xs text-text-muted max-w-sm mt-1">
              {statusFilter !== 'ALL'
                ? `There are currently no laboratories matching status "${statusFilter}".`
                : 'No diagnostic facilities registered in the system.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredLabs.map((lab) => (
            <Card key={lab.id} className="overflow-hidden hover:border-brand/40 transition-colors">
              <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Lab Info */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-base font-semibold text-text truncate">{lab.name}</h2>
                    {getStatusBadge(lab.verificationStatus)}
                    <span className="text-[11px] font-mono text-text-muted bg-surface-secondary px-2 py-0.5 rounded border border-border">
                      Lic: {lab.licenseNumber}
                    </span>
                  </div>

                  {lab.legalName && lab.legalName !== lab.name && (
                    <p className="text-xs text-text-muted">
                      Legal Entity: <span className="text-text font-medium">{lab.legalName}</span>
                    </p>
                  )}

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-text-muted pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <span className="truncate">{lab.contactEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <span className="truncate">{lab.contactPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      <span className="truncate">
                        {[lab.address, lab.city, lab.state, lab.pincode].filter(Boolean).join(', ') ||
                          'Address not specified'}
                      </span>
                    </div>
                  </div>

                  {/* Accreditations & Samples */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                    {lab.accreditationDetails && Object.keys(lab.accreditationDetails).length > 0 && (
                      <div className="flex items-center gap-1.5 text-brand font-medium">
                        <FileText className="h-3.5 w-3.5" />
                        Accreditations:{' '}
                        {Object.entries(lab.accreditationDetails)
                          .map(([k, v]) => `${k} (${v})`)
                          .join(', ')}
                      </div>
                    )}
                    {lab.supportedSampleTypes && lab.supportedSampleTypes.length > 0 && (
                      <div className="text-text-muted">
                        Samples: {lab.supportedSampleTypes.join(', ')}
                      </div>
                    )}
                  </div>

                  {/* Rejection / Suspension Notice */}
                  {lab.verificationNotes && (
                    <div className="mt-2 p-2.5 bg-surface-secondary border border-border rounded text-xs text-text space-y-0.5">
                      <span className="font-semibold text-text-muted">Admin Note:</span>{' '}
                      <span className="italic">{lab.verificationNotes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0">
                  {lab.verificationStatus === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        className="w-full sm:w-32 gap-1.5"
                        onClick={() => openReviewModal(lab, 'VERIFIED')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-32 gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                        onClick={() => openReviewModal(lab, 'REJECTED')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </>
                  )}

                  {lab.verificationStatus === 'VERIFIED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-32 gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 border-amber-200"
                      onClick={() => openReviewModal(lab, 'SUSPENDED')}
                    >
                      <PauseCircle className="h-3.5 w-3.5" />
                      Suspend
                    </Button>
                  )}

                  {(lab.verificationStatus === 'REJECTED' || lab.verificationStatus === 'SUSPENDED') && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-32 gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                      onClick={() => openReviewModal(lab, 'VERIFIED')}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Re-verify
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Review Modal Dialog */}
      <Dialog
        isOpen={!!selectedLab && !!reviewAction}
        onClose={closeReviewModal}
        title={
          reviewAction === 'VERIFIED'
            ? 'Verify Laboratory Facility'
            : reviewAction === 'REJECTED'
            ? 'Reject Laboratory Application'
            : 'Suspend Laboratory Facility'
        }
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-text-muted">
            You are changing credentialing status for{' '}
            <strong className="text-text">{selectedLab?.name}</strong> (License:{' '}
            <span className="font-mono">{selectedLab?.licenseNumber}</span>) to{' '}
            <strong
              className={
                reviewAction === 'VERIFIED'
                  ? 'text-emerald-600'
                  : reviewAction === 'REJECTED'
                  ? 'text-rose-600'
                  : 'text-amber-600'
              }
            >
              {reviewAction}
            </strong>
            .
          </p>

          {errorMessage && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs rounded-md">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-text mb-1">
              Administrative Review Notes{' '}
              {reviewAction === 'REJECTED' ? (
                <span className="text-rose-500 font-bold">* Required</span>
              ) : (
                <span className="text-text-muted">(Optional)</span>
              )}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                reviewAction === 'REJECTED'
                  ? 'State specific reasons for rejection (e.g., Invalid regulatory license, unverified accreditation)...'
                  : 'Enter audit notes or review context...'
              }
              rows={3}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-md text-text focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeReviewModal}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={
                reviewAction === 'VERIFIED'
                  ? 'primary'
                  : reviewAction === 'REJECTED'
                  ? 'destructive'
                  : 'outline'
              }
              size="sm"
              onClick={() => reviewMutation.mutate()}
              isLoading={reviewMutation.isPending}
            >
              Confirm {reviewAction}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
