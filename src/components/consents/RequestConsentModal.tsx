'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { consentsApi } from '@/lib/api/consents';
import { doctorApi } from '@/lib/api/doctor';
import {
  ConsentPurpose,
  ConsentResourceType,
  ConsentAccessLevel,
  CreateConsentScopePayload,
} from '@/lib/api/types';
import { formatConsentPurpose, formatResourceCategory } from '@/lib/consent-utils';
import {
  KeyRound,
  CheckCircle2,
  Calendar,
  Eye,
  Download,
  FileText,
  User,
  Clock,
  ArrowRight,
  ArrowLeft,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
  AlertCircle,
} from 'lucide-react';

interface RequestConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preselectedPatientId?: string;
  preselectedPatientName?: string;
  onOpenConnectPatient?: () => void;
}

const CATEGORY_OPTIONS = [
  { id: 'LAB_REPORT', label: 'Lab & Diagnostic Reports', desc: 'Blood panels, pathology, urinalysis' },
  { id: 'PRESCRIPTION', label: 'Prescriptions', desc: 'Active and past medications' },
  { id: 'CONSULTATION', label: 'Consultations', desc: 'Physician notes & clinical summaries' },
  { id: 'IMAGING_REPORT', label: 'Imaging & Radiology', desc: 'MRI, CT, X-Rays, Ultrasound reports' },
  { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries', desc: 'Inpatient hospital stay records' },
];

const PURPOSE_OPTIONS: { id: ConsentPurpose; label: string; desc: string }[] = [
  {
    id: 'REVIEW_RECENT_REPORTS',
    label: 'Review Recent Investigations',
    desc: 'Review laboratory, diagnostic, or imaging reports prior to clinical assessment.',
  },
  {
    id: 'FOLLOW_UP_CARE',
    label: 'Follow-Up Care',
    desc: 'Ongoing management and monitoring for existing clinical condition.',
  },
  {
    id: 'SECOND_OPINION',
    label: 'Specialist Second Opinion',
    desc: 'Comprehensive review of diagnosis and prior diagnostic findings.',
  },
  {
    id: 'CONSULTATION',
    label: 'Clinical Consultation',
    desc: 'Pre-visit evaluation to prepare treatment plan.',
  },
  {
    id: 'INVESTIGATION_REVIEW',
    label: 'Diagnostic Evaluation',
    desc: 'Review of requested imaging or lab investigations.',
  },
];

const DURATION_PRESETS = [
  { days: 1, label: '24 Hours' },
  { days: 7, label: '7 Days (Recommended)' },
  { days: 14, label: '14 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
];

export function RequestConsentModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedPatientId,
  preselectedPatientName,
  onOpenConnectPatient,
}: RequestConsentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [patientId, setPatientId] = useState<string>(preselectedPatientId || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'LAB_REPORT',
    'PRESCRIPTION',
    'CONSULTATION',
  ]);
  const [includeTimeline, setIncludeTimeline] = useState<boolean>(true);
  const [purpose, setPurpose] = useState<ConsentPurpose>('REVIEW_RECENT_REPORTS');
  const [purposeDescription, setPurposeDescription] = useState<string>('');
  const [durationDays, setDurationDays] = useState<number>(7);
  const [accessLevel, setAccessLevel] = useState<ConsentAccessLevel>('VIEW');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Fetch doctor's assigned patients for selection dropdown
  const { data: assignedPatients, isLoading: isLoadingPatients } = useQuery({
    queryKey: ['doctor-assigned-patients'],
    queryFn: () => doctorApi.getDoctorAssignedPatients(),
    enabled: isOpen && !preselectedPatientId,
  });

  const resetForm = () => {
    setStep(1);
    if (!preselectedPatientId) setPatientId('');
    setSelectedCategories(['LAB_REPORT', 'PRESCRIPTION', 'CONSULTATION']);
    setIncludeTimeline(true);
    setPurpose('REVIEW_RECENT_REPORTS');
    setPurposeDescription('');
    setDurationDays(7);
    setAccessLevel('VIEW');
    setError(null);
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1 && !includeTimeline) return; // Keep at least one
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === CATEGORY_OPTIONS.length) {
      setSelectedCategories(['LAB_REPORT']);
    } else {
      setSelectedCategories(CATEGORY_OPTIONS.map((c) => c.id));
    }
  };

  const calculateExpiresAt = () => {
    const date = new Date();
    date.setDate(date.getDate() + durationDays);
    return date.toISOString();
  };

  const handleSubmit = async () => {
    if (!patientId) {
      setError('Please select or specify a target patient.');
      return;
    }
    if (!purposeDescription.trim()) {
      setError('Please provide a clinical rationale explaining the need for access.');
      return;
    }

    const scopes: CreateConsentScopePayload[] = [];

    // Add category document scopes
    selectedCategories.forEach((cat) => {
      scopes.push({
        resourceType: 'DOCUMENT',
        resourceCategory: cat,
        accessLevel,
      });
    });

    // Add timeline if selected
    if (includeTimeline) {
      scopes.push({
        resourceType: 'TIMELINE',
        accessLevel,
      });
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await consentsApi.requestConsent({
        patientId,
        purpose,
        purposeDescription: purposeDescription.trim(),
        expiresAt: calculateExpiresAt(),
        scopes,
      });

      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit consent request. Please verify patient ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPatientDisplay =
    preselectedPatientName ||
    assignedPatients?.find((p) => p.patientId === patientId)?.patient?.fullName ||
    'Selected Patient';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Request Patient Record Access"
      description="Patient-consented healthcare data exchange governed by scoped cryptographic boundaries."
      maxWidth="lg"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Consent Request Dispatched</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Your authorization request has been routed to <strong>{selectedPatientDisplay}</strong>.
            You will receive instant access to the requested record categories as soon as the patient approves.
          </p>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5 text-left">
          {error && (
            <ErrorMessage
              title="Request failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          {/* Stepper Indicator */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-teal-800">
              <span className="h-5 w-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">
                {step}
              </span>
              <span>
                {step === 1 && 'Step 1: Patient & Scope'}
                {step === 2 && 'Step 2: Purpose & Rationale'}
                {step === 3 && 'Step 3: Duration & Permissions'}
                {step === 4 && 'Step 4: Review & Send'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Step {step} of 4</span>
          </div>

          {/* STEP 1: PATIENT & SCOPE */}
          {step === 1 && (
            <div className="space-y-4">
              {!preselectedPatientId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="patient-select-dropdown" className="block text-xs font-semibold text-slate-700">
                      Connected Patient <span className="text-rose-500">*</span>
                    </label>
                    {assignedPatients && assignedPatients.length > 0 && (
                      <span className="text-[11px] text-slate-400">
                        {assignedPatients.length} connected {assignedPatients.length === 1 ? 'patient' : 'patients'}
                      </span>
                    )}
                  </div>

                  {isLoadingPatients ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                      Loading connected patient roster...
                    </div>
                  ) : assignedPatients && assignedPatients.length > 0 ? (
                    <div className="space-y-1.5">
                      <select
                        id="patient-select-dropdown"
                        value={patientId}
                        onChange={(e) => {
                          setPatientId(e.target.value);
                          if (error) setError(null);
                        }}
                        className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 shadow-2xs"
                      >
                        <option value="">-- Choose from your connected patient roster --</option>
                        {assignedPatients.map((p) => (
                          <option key={p.patientId} value={p.patientId}>
                            {p.patient.fullName || 'Patient'} ({p.patient.email}){p.patient.city ? ` • ${p.patient.city}` : ''}
                          </option>
                        ))}
                      </select>
                      {onOpenConnectPatient && (
                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                          <span>Need to request records for a new patient?</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleClose();
                              onOpenConnectPatient();
                            }}
                            className="text-teal-700 hover:text-teal-900 font-medium hover:underline inline-flex items-center gap-1"
                          >
                            <UserPlus className="h-3 w-3" />
                            Invite patient by email
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 mt-0.5">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-amber-950">
                            No Connected Patients in Your Clinical Roster
                          </h4>
                          <p className="text-[11px] text-amber-900/80 leading-relaxed">
                            CarePath requires an established doctor-patient connection before requesting medical record access. You have not connected with any patients yet.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2">
                        {onOpenConnectPatient ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="primary"
                            onClick={() => {
                              handleClose();
                              onOpenConnectPatient();
                            }}
                            leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                          >
                            Invite Patient by Email
                          </Button>
                        ) : (
                          <Link href="/app/patients">
                            <Button
                              type="button"
                              size="sm"
                              variant="primary"
                              leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                            >
                              Connect with a Patient
                            </Button>
                          </Link>
                        )}
                        <span className="text-[11px] text-amber-800">
                          Send a Care Team invitation to the patient’s registered email address.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {preselectedPatientId && (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-teal-700" />
                    <span className="font-semibold text-slate-800">
                      Target Patient: {preselectedPatientName || patientId}
                    </span>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Direct Request
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Requested Record Categories
                  </label>
                  <button
                    type="button"
                    onClick={handleSelectAllCategories}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-medium"
                  >
                    {selectedCategories.length === CATEGORY_OPTIONS.length
                      ? 'Deselect All'
                      : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
                          isChecked
                            ? 'border-teal-700 bg-teal-50/40 text-slate-900'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="mt-0.5 text-teal-800 focus:ring-teal-700 rounded"
                        />
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold text-slate-800">{cat.label}</p>
                          <p className="text-[11px] text-slate-500">{cat.desc}</p>
                        </div>
                      </div>
                    );
                  })}

                  <div
                    onClick={() => setIncludeTimeline(!includeTimeline)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-3 ${
                      includeTimeline
                        ? 'border-teal-700 bg-teal-50/40 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={includeTimeline}
                      onChange={() => {}}
                      className="mt-0.5 text-teal-800 focus:ring-teal-700 rounded"
                    />
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800">Health Timeline</p>
                      <p className="text-[11px] text-slate-500">
                        Chronological sequence of clinical events, diagnostics, and doctor notes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PURPOSE & RATIONALE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Standardized Clinical Objective
                </label>
                <div className="space-y-2">
                  {PURPOSE_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        purpose === opt.id
                          ? 'border-teal-700 bg-teal-50/50 text-slate-900'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="purpose"
                        value={opt.id}
                        checked={purpose === opt.id}
                        onChange={() => setPurpose(opt.id)}
                        className="mt-0.5 text-teal-800 focus:ring-teal-700"
                      />
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-slate-900">{opt.label}</p>
                        <p className="text-[11px] text-slate-500">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Clinical Rationale (Visible to Patient)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Explain clearly to the patient why access to these records is necessary for their care.
                </p>
                <textarea
                  rows={3}
                  value={purposeDescription}
                  onChange={(e) => setPurposeDescription(e.target.value)}
                  placeholder="e.g. Review recent complete blood count and thyroid panel ahead of our scheduled follow-up consultation on Thursday."
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700"
                  required
                />
              </div>
            </div>
          )}

          {/* STEP 3: DURATION & PERMISSIONS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Access Duration
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Principle of least privilege: select the shortest duration necessary.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DURATION_PRESETS.map((preset) => (
                    <button
                      key={preset.days}
                      type="button"
                      onClick={() => setDurationDays(preset.days)}
                      className={`p-2.5 rounded-lg border text-xs font-semibold transition-colors text-center ${
                        durationDays === preset.days
                          ? 'border-teal-700 bg-teal-800 text-white shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Requested Permissions
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => setAccessLevel('VIEW')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                      accessLevel === 'VIEW'
                        ? 'border-teal-700 bg-teal-50/50 text-teal-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Eye className="h-4 w-4 mt-0.5 text-teal-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">View Only</p>
                      <p className="text-[11px] text-slate-500">
                        View reports securely in CarePath browser viewer without local download.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setAccessLevel('DOWNLOAD')}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-start gap-2.5 ${
                      accessLevel === 'DOWNLOAD'
                        ? 'border-teal-700 bg-teal-50/50 text-teal-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Download className="h-4 w-4 mt-0.5 text-teal-700" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">View & Download</p>
                      <p className="text-[11px] text-slate-500">
                        Permit temporary local export for offline clinical inspection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & CONFIRM */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Recipient Patient
                  </span>
                  <span className="text-xs font-bold text-slate-900">{selectedPatientDisplay}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Objective
                  </span>
                  <span className="text-xs font-medium text-slate-900">
                    {formatConsentPurpose(purpose)}
                  </span>
                </div>

                <div className="border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                    Rationale
                  </span>
                  <p className="text-xs text-slate-700 italic bg-white p-2 rounded border border-slate-200">
                    &ldquo;{purposeDescription}&rdquo;
                  </p>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Scopes
                  </span>
                  <span className="text-xs text-slate-700 font-medium">
                    {selectedCategories.map((c) => formatResourceCategory(c)).join(', ')}
                    {includeTimeline ? ', Health Timeline' : ''}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Duration & Level
                  </span>
                  <span className="text-xs text-slate-700 font-medium">
                    {durationDays} Days • {accessLevel === 'DOWNLOAD' ? 'View & Download' : 'View Only'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-teal-900 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  CarePath will notify the patient immediately. Access is cryptographically disabled until the patient approves.
                </p>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep((s) => (s - 1) as any)}
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              >
                Back
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            )}

            {step < 4 ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (step === 1 && !patientId) {
                    setError('Please select a patient from your connected roster.');
                    return;
                  }
                  if (step === 2 && !purposeDescription.trim()) {
                    setError('Please provide a specific clinical rationale');
                    return;
                  }
                  setError(null);
                  setStep((s) => (s + 1) as any);
                }}
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                leftIcon={<Send className="h-3.5 w-3.5" />}
              >
                Send Request
              </Button>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}
