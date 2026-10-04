'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, DoctorAccessRequest, DoctorProfile } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  Star,
  Award,
  FileCheck,
  UserCheck,
  Send,
  Building,
  AlertCircle,
  CheckCircle2,
  Search,
} from 'lucide-react';

export default function PatientCareTeamPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [reviewDoctorId, setReviewDoctorId] = useState<string | null>(null);
  const [reviewDoctorName, setReviewDoctorName] = useState<string>('');
  const [rating, setRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [doctorSearch, setDoctorSearch] = useState<string>('');
  const [assignedSuccessDoctorName, setAssignedSuccessDoctorName] = useState<string | null>(null);

  // 1. Fetch incoming/active consent requests
  const {
    data: requests,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useQuery({
    queryKey: ['patient-access-requests'],
    queryFn: () => doctorApi.getPatientAccessRequests(),
    enabled: !!user,
  });

  // 2. Fetch doctor directory
  const {
    data: doctors,
    isLoading: doctorsLoading,
    refetch: refetchDoctors,
  } = useQuery({
    queryKey: ['verified-doctors-directory'],
    queryFn: () => doctorApi.listDoctors(),
    enabled: !!user,
  });

  // Respond Mutation (Approve / Reject / Revoke)
  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'APPROVED' | 'REJECTED' | 'REVOKED' }) =>
      doctorApi.respondAccessRequest(id, status),
    onSuccess: () => {
      refetchRequests();
      queryClient.invalidateQueries({ queryKey: ['patient-access-requests'] });
    },
  });

  // Assign Doctor Mutation
  const assignMutation = useMutation({
    mutationFn: ({ doctorId, doctorName }: { doctorId: string; doctorName: string }) =>
      doctorApi.assignDoctor(doctorId),
    onSuccess: (_, variables) => {
      setAssignedSuccessDoctorName(variables.doctorName);
      refetchRequests();
      refetchDoctors();
    },
  });

  // Submit Review Mutation
  const reviewMutation = useMutation({
    mutationFn: () =>
      doctorApi.addDoctorReview(reviewDoctorId!, rating, reviewComment),
    onSuccess: () => {
      setReviewSuccess(true);
      setTimeout(() => {
        setReviewSuccess(false);
        setReviewDoctorId(null);
        setReviewComment('');
        refetchDoctors();
      }, 2000);
    },
  });

  const pendingRequests = (requests || []).filter((r) => r.status === 'PENDING');
  const approvedDoctors = (requests || []).filter((r) => r.status === 'APPROVED');

  const filteredDoctors = (doctors || []).filter((doc) => {
    if (!doctorSearch.trim()) return true;
    const q = doctorSearch.toLowerCase();
    return (
      doc.fullName?.toLowerCase().includes(q) ||
      doc.specialization?.toLowerCase().includes(q) ||
      doc.hospitalAffiliation?.toLowerCase().includes(q) ||
      doc.city?.toLowerCase().includes(q) ||
      doc.clinicName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Stethoscope className="h-6 w-6 text-teal-700" />
          Care Team & Clinician Permissions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          You are the sole owner of your Health Vault. Authorize clinicians to review your reports or revoke access anytime.
        </p>
      </div>

      {/* Pending Consent Requests Banner */}
      {pendingRequests.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-amber-700" />
            <h2 className="text-sm font-bold text-amber-950">
              Pending Access Requests ({pendingRequests.length})
            </h2>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            The following physicians have requested authorization to access your health vault records for clinical consultation:
          </p>

          <div className="divide-y divide-amber-200/60 bg-white rounded-lg border border-amber-200 overflow-hidden">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      {req.doctor?.doctorProfile?.fullName || req.doctor?.email}
                    </span>
                    {req.doctor?.doctorProfile?.specialization && (
                      <span className="text-xs text-slate-500 font-medium">
                        • {req.doctor.doctorProfile.specialization}
                      </span>
                    )}
                  </div>
                  {req.notes && (
                    <p className="text-xs text-slate-600 italic">&ldquo;{req.notes}&rdquo;</p>
                  )}
                  <span className="text-[10px] text-slate-400 block">
                    Requested on {formatDate(req.requestedAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => respondMutation.mutate({ id: req.id, status: 'REJECTED' })}
                    isLoading={respondMutation.isPending}
                    leftIcon={<X className="h-3.5 w-3.5" />}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => respondMutation.mutate({ id: req.id, status: 'APPROVED' })}
                    isLoading={respondMutation.isPending}
                    leftIcon={<Check className="h-3.5 w-3.5" />}
                  >
                    Approve Access
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Care Team (Approved Doctors) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Authorized Care Team ({approvedDoctors.length})
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Doctors who currently have read & review access to your diagnostic vault.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {requestsLoading ? (
            <div className="p-6">
              <LoadingSpinner message="Checking active permissions..." />
            </div>
          ) : approvedDoctors.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {approvedDoctors.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {req.doctor?.doctorProfile?.fullName || req.doctor?.email}
                      </h3>
                      <Badge variant="success" size="sm" dot>
                        Access Active
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {req.doctor?.doctorProfile?.specialization || 'Clinical Specialist'} •{' '}
                      {req.doctor?.doctorProfile?.hospitalAffiliation || 'Hospital Practice'}
                    </p>
                    {req.doctor?.doctorProfile?.medicalCertificate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mt-1">
                        <FileCheck className="h-3 w-3" />
                        {req.doctor.doctorProfile.medicalCertificate}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setReviewDoctorId(req.doctorId);
                        setReviewDoctorName(
                          req.doctor?.doctorProfile?.fullName || req.doctor?.email || 'Doctor',
                        );
                      }}
                      leftIcon={<Star className="h-3.5 w-3.5 text-amber-500" />}
                    >
                      Rate & Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-300 text-slate-600 hover:text-rose-600 hover:border-rose-300"
                      onClick={() => respondMutation.mutate({ id: req.id, status: 'REVOKED' })}
                      isLoading={respondMutation.isPending}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No doctors currently have access to your vault. Browse verified clinicians below to assign a physician.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Doctor Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Verified Clinicians Directory
            </h2>
            <p className="text-xs text-slate-500">
              Browse verified physicians and connect them to your CarePath team for consultation and second opinions.
            </p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search doctor, specialty, city..."
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>
        </div>

        {/* How Care Team Connections Work Informational Callout */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-bold text-teal-950 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              How Care Team Connections Work
            </span>
            <p className="text-teal-900/80 text-[11px] leading-relaxed">
              You are the sole owner of your Health Vault. Connect with a verified doctor below by clicking <strong>Assign to Care Team</strong>, or approve an invitation received from your doctor under Pending Requests above. You can revoke access anytime.
            </p>
          </div>
        </div>

        {assignedSuccessDoctorName && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                <strong>{assignedSuccessDoctorName}</strong> has been assigned to your Care Team with approved vault access.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAssignedSuccessDoctorName(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {doctorsLoading ? (
          <div className="py-8">
            <LoadingSpinner message="Loading clinician directory..." />
          </div>
        ) : filteredDoctors && filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDoctors.map((doc) => {
              const isAssigned = approvedDoctors.some((r) => r.doctorId === doc.id);

              return (
                <Card key={doc.id} className="hover:border-teal-700/30 transition-colors">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{doc.fullName}</h3>
                          <Badge variant="brand" size="sm">
                            Verified
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{doc.specialization}</p>
                      </div>

                      {/* Care Rating */}
                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-1 rounded text-xs">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-slate-900">
                          {doc.averageRating?.toFixed(1) || '5.0'}
                        </span>
                        <span className="text-[10px] text-slate-500">({doc.reviewCount || 0})</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Award className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                        <span>
                          <strong>{doc.yearsOfExperience || 0} Years</strong> Clinical Practice
                        </span>
                      </div>
                      {doc.hospitalAffiliation && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                          <span>{doc.hospitalAffiliation}</span>
                        </div>
                      )}
                      {doc.medicalCertificate && (
                        <div className="flex items-center gap-2">
                          <FileCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="text-emerald-800 text-[11px] font-medium">
                            {doc.medicalCertificate}
                          </span>
                        </div>
                      )}
                    </div>

                    {doc.bio && (
                      <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        &ldquo;{doc.bio}&rdquo;
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        {doc.consultationFee || 'Standard Consultation'}
                      </span>

                      {isAssigned ? (
                        <Badge variant="success" size="sm">
                          Assigned to Care Team
                        </Badge>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            assignMutation.mutate({
                              doctorId: doc.id,
                              doctorName: doc.fullName || 'Physician',
                            })
                          }
                          isLoading={assignMutation.isPending}
                          leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                        >
                          Assign to Care Team
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Stethoscope className="h-6 w-6" />}
            title={doctorSearch ? 'No clinicians found' : 'No clinicians listed yet'}
            description={
              doctorSearch
                ? `No verified doctors match "${doctorSearch}". Try searching for another name or specialty.`
                : 'Verified doctors will appear here as they register on the CarePath network.'
            }
          />
        )}
      </div>

      {/* Review & Rating Modal */}
      {reviewDoctorId && (
        <Dialog
          isOpen={!!reviewDoctorId}
          onClose={() => setReviewDoctorId(null)}
          title={`Review Care Experience: ${reviewDoctorName}`}
          description="Rate and provide confidential feedback regarding your clinical interaction."
          maxWidth="md"
        >
          {reviewSuccess ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-semibold text-slate-900">Review Submitted</h3>
              <p className="text-xs text-slate-500">
                Thank you for contributing to the verified CarePath clinician review network.
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-sm font-bold text-slate-800 ml-2">
                    {rating} out of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Comments & Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your consultation, communication clarity, and care quality..."
                  className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReviewDoctorId(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  isLoading={reviewMutation.isPending}
                  onClick={() => reviewMutation.mutate()}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}
    </div>
  );
}
