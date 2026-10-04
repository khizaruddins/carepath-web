'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, DoctorVerificationStatus } from '@/lib/api/doctor';
import { DoctorVerificationItem } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Building,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Search,
} from 'lucide-react';

export default function DoctorVerificationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Review modal state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorVerificationItem | null>(null);
  const [reviewAction, setReviewAction] = useState<DoctorVerificationStatus | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    data: doctors,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-doctor-verifications'],
    queryFn: () => doctorApi.listDoctorVerifications(),
  });

  const reviewMutation = useMutation({
    mutationFn: () => {
      if (!selectedDoctor || !reviewAction) throw new Error('No doctor selected');
      return doctorApi.reviewDoctorVerification(
        selectedDoctor.id,
        reviewAction,
        notes || undefined,
        reason || undefined,
      );
    },
    onSuccess: (res) => {
      setSuccessMessage(res.message);
      queryClient.invalidateQueries({ queryKey: ['admin-doctor-verifications'] });
      closeReviewModal();
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update doctor verification status');
    },
  });

  const openReviewModal = (doctor: DoctorVerificationItem, action: DoctorVerificationStatus) => {
    setSelectedDoctor(doctor);
    setReviewAction(action);
    setNotes('');
    setReason('');
    setErrorMessage(null);
  };

  const closeReviewModal = () => {
    setSelectedDoctor(null);
    setReviewAction(null);
    setNotes('');
    setReason('');
    setErrorMessage(null);
  };

  const filteredDoctors = (doctors || []).filter((doc) => {
    const prof = doc.doctorProfile;
    const currentStatus = prof?.verificationStatus || 'PENDING';

    if (statusFilter !== 'ALL' && currentStatus !== statusFilter) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = prof?.fullName?.toLowerCase().includes(q);
      const matchEmail = doc.email.toLowerCase().includes(q);
      const matchLicense = prof?.licenseNumber?.toLowerCase().includes(q) || prof?.registrationNumber?.toLowerCase().includes(q);
      const matchSpec = prof?.specialization?.toLowerCase().includes(q);
      return matchName || matchEmail || matchLicense || matchSpec;
    }

    return true;
  });

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
              Clinician Credential Verification
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review professional medical licensure, hospital affiliations, and board credentials before granting physician privileges.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium w-full sm:w-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === tab
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'ALL' ? 'All Applicants' : tab === 'PENDING' ? 'Pending Review' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by physician, license, or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
          />
        </div>
      </div>

      {/* Main Content List */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <ErrorMessage message={(error as any)?.message || 'Failed to load clinician applications'} onRetry={() => refetch()} />
      ) : filteredDoctors.length === 0 ? (
        <Card className="py-12 text-center text-xs text-slate-500">
          <Users className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-slate-700">No clinician applications found</p>
          <p className="mt-1">There are no doctors matching the selected filter criteria.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredDoctors.map((doc) => {
            const prof = doc.doctorProfile;
            const currentStatus = prof?.verificationStatus || 'PENDING';

            return (
              <Card key={doc.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-3 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-teal-100/80 text-teal-800 flex items-center justify-center font-bold text-sm">
                      {prof?.fullName ? prof.fullName.charAt(0) : 'D'}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-slate-900">
                        {prof?.fullName || 'Physician Profile Pending'}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.email} • Registered {formatDate(doc.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentStatus === 'VERIFIED' && (
                      <Badge variant="success" size="sm" dot>
                        Verified Clinician
                      </Badge>
                    )}
                    {currentStatus === 'PENDING' && (
                      <Badge variant="warning" size="sm" dot>
                        Awaiting Verification
                      </Badge>
                    )}
                    {currentStatus === 'REJECTED' && (
                      <Badge variant="error" size="sm" dot>
                        Rejected
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-4">
                  {/* Credentials Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Medical License
                      </span>
                      <p className="font-mono font-semibold text-slate-900">
                        {prof?.licenseNumber || prof?.registrationNumber || 'Not provided'}
                      </p>
                      {prof?.registrationAuthority && (
                        <p className="text-[11px] text-slate-500">{prof.registrationAuthority}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Specialization & Experience
                      </span>
                      <p className="font-semibold text-slate-900">
                        {prof?.specialization || 'General Practitioner'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {prof?.yearsOfExperience ? `${prof.yearsOfExperience} years clinical practice` : 'Experience not listed'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Hospital Affiliation
                      </span>
                      <p className="font-semibold text-slate-900">
                        {prof?.hospitalAffiliation || 'Independent Practice'}
                      </p>
                      <p className="text-[11px] text-slate-500">{prof?.city || 'Location unassigned'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium uppercase tracking-wider block">
                        Board Certifications
                      </span>
                      <p className="text-slate-800 line-clamp-2">
                        {prof?.medicalCertificate || prof?.education || 'None documented'}
                      </p>
                    </div>
                  </div>

                  {prof?.bio && (
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
                      <span className="font-medium text-slate-700 block mb-1">Physician Statement:</span>
                      <p className="text-slate-600 leading-relaxed italic">{prof.bio}</p>
                    </div>
                  )}

                  {prof?.verificationNotes && (
                    <div className="p-2.5 rounded bg-teal-50/50 border border-teal-100 text-xs text-teal-900">
                      <span className="font-semibold">Verification Notes:</span> {prof.verificationNotes}
                    </div>
                  )}

                  {prof?.rejectionReason && (
                    <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-900">
                      <span className="font-semibold">Rejection Reason:</span> {prof.rejectionReason}
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    {currentStatus !== 'VERIFIED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        onClick={() => openReviewModal(doc, 'VERIFIED')}
                      >
                        Approve & Verify Clinician
                      </Button>
                    )}
                    {currentStatus !== 'REJECTED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-700 hover:bg-rose-50"
                        leftIcon={<XCircle className="h-3.5 w-3.5" />}
                        onClick={() => openReviewModal(doc, 'REJECTED')}
                      >
                        Reject / Request Revisions
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {selectedDoctor && reviewAction && (
        <Dialog
          isOpen={true}
          onClose={closeReviewModal}
          title={
            reviewAction === 'VERIFIED'
              ? `Approve Clinician: ${selectedDoctor.doctorProfile?.fullName || selectedDoctor.email}`
              : `Reject Application: ${selectedDoctor.doctorProfile?.fullName || selectedDoctor.email}`
          }
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              {reviewAction === 'VERIFIED'
                ? 'Approving will grant this physician full clinical consultation privileges and allow patients to discover and request consultations.'
                : 'Rejecting will flag this profile and require the clinician to revise their credentials before re-applying.'}
            </p>

            {errorMessage && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded border border-rose-200">
                {errorMessage}
              </div>
            )}

            {reviewAction === 'VERIFIED' ? (
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700">Verification Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Medical board registry confirmed active and good standing."
                  className="w-full p-2.5 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="font-medium text-slate-700">Rejection / Revision Reason (Required)</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Medical registration number could not be validated with state licensing board."
                  className="w-full p-2.5 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={closeReviewModal}>
                Cancel
              </Button>
              <Button
                variant={reviewAction === 'VERIFIED' ? 'primary' : 'destructive'}
                size="sm"
                isLoading={reviewMutation.isPending}
                disabled={reviewAction === 'REJECTED' && !reason.trim()}
                onClick={() => reviewMutation.mutate()}
              >
                {reviewAction === 'VERIFIED' ? 'Confirm Verification' : 'Confirm Rejection'}
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
