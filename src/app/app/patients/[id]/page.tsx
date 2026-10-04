'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, FollowUpStatus } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate, formatDateTime, formatCategory, formatFileSize } from '@/lib/utils';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CalendarCheck,
  ClipboardList,
  Pill,
  Microscope,
  Send,
  Plus,
  ExternalLink,
  Clock,
  HeartPulse,
  AlertTriangle,
  FolderLock,
  Stethoscope,
  CheckCircle2,
  FileText,
  AlertCircle,
  FileCode,
  Tag,
  Share2,
  KeyRound,
  Lock,
  Building2,
} from 'lucide-react';
import { RequestConsentModal } from '@/components/consents/RequestConsentModal';
import { consentsApi } from '@/lib/api/consents';
import { labApi } from '@/lib/api/lab';
import { getExpiryRemainingText, formatResourceCategory } from '@/lib/consent-utils';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';

export default function PatientWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const patientId = params?.id as string;

  const initialTab = (searchParams?.get('tab') as any) || 'overview';
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'consultations' | 'prescriptions' | 'investigations' | 'followups' | 'timeline'>(
    ['overview', 'documents', 'consultations', 'prescriptions', 'investigations', 'followups', 'timeline'].includes(initialTab)
      ? initialTab
      : 'overview',
  );

  // Modals state
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [rxModalOpen, setRxModalOpen] = useState(false);
  const [invModalOpen, setInvModalOpen] = useState(false);
  const [referralModalOpen, setReferralModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [feedbackDocId, setFeedbackDocId] = useState<string | null>(null);
  const [requestConsentOpen, setRequestConsentOpen] = useState(false);

  // Form states
  // Consultation
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [consultFollowUpDate, setConsultFollowUpDate] = useState('');
  const [consultFollowUpInstructions, setConsultFollowUpInstructions] = useState('');

  // Prescription
  const [rxNotes, setRxNotes] = useState('');
  const [rxItems, setRxItems] = useState([
    { medicineName: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
  ]);

  // Investigation
  const [invName, setInvName] = useState('');
  const [invCategory, setInvCategory] = useState('LABORATORY');
  const [invReason, setInvReason] = useState('');
  const [invPriority, setInvPriority] = useState('ROUTINE');
  const [invNotes, setInvNotes] = useState('');
  const [selectedLabId, setSelectedLabId] = useState('');

  // Verified Labs for Diagnostic Investigation Order
  const { data: verifiedLabs } = useQuery({
    queryKey: ['verified-labs-selection'],
    queryFn: () => labApi.listVerifiedLabs(),
  });

  // Referral
  const [refSpecialty, setRefSpecialty] = useState('');
  const [refProvider, setRefProvider] = useState('');
  const [refReason, setRefReason] = useState('');
  const [refNotes, setRefNotes] = useState('');
  const [refPriority, setRefPriority] = useState('ROUTINE');

  // Follow-up
  const [fuDate, setFuDate] = useState('');
  const [fuReason, setFuReason] = useState('');
  const [fuInstructions, setFuInstructions] = useState('');

  // Document feedback
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackRecs, setFeedbackRecs] = useState('');

  // 1. Fetch Patient Workspace
  const {
    data: workspace,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient-workspace', patientId],
    queryFn: () => doctorApi.getPatientWorkspace(patientId),
    enabled: !!patientId && !!user,
  });

  // Fetch active consent grant
  const { data: patientConsents } = useQuery({
    queryKey: ['patient-consent', patientId],
    queryFn: () => consentsApi.getConsents({ patientId, status: 'APPROVED' }),
    enabled: !!patientId && !!user,
  });

  const activeConsent = patientConsents?.consents?.[0];
  const expiry = activeConsent ? getExpiryRemainingText(activeConsent.expiresAt) : null;

  // Mutations
  const createConsultMutation = useMutation({
    mutationFn: () =>
      doctorApi.createConsultation(patientId, {
        reasonForVisit,
        chiefComplaint,
        clinicalNotes,
        assessment,
        plan,
        followUpDate: consultFollowUpDate || undefined,
        followUpInstructions: consultFollowUpInstructions || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setConsultModalOpen(false);
      setReasonForVisit('');
      setChiefComplaint('');
      setClinicalNotes('');
      setAssessment('');
      setPlan('');
      setConsultFollowUpDate('');
      setConsultFollowUpInstructions('');
    },
  });

  const createRxMutation = useMutation({
    mutationFn: () =>
      doctorApi.createPrescription(patientId, {
        notes: rxNotes || undefined,
        items: rxItems,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setRxModalOpen(false);
      setRxNotes('');
      setRxItems([{ medicineName: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' }]);
    },
  });

  const createInvMutation = useMutation({
    mutationFn: async () => {
      const inv = await doctorApi.createInvestigation(patientId, {
        investigationName: invName,
        category: invCategory,
        reason: invReason,
        priority: invPriority,
        notes: invNotes || undefined,
      });

      // If user selected a laboratory for laboratory test, initiate lab order
      if (selectedLabId && invCategory === 'LABORATORY') {
        try {
          await labApi.createOrder({
            labId: selectedLabId,
            patientId,
            investigationRequestId: inv.investigation?.id,
            tests: [invName],
            priority: invPriority,
            instructions: invNotes || undefined,
          });
        } catch (e) {
          console.warn('Failed to auto-create linked lab order:', e);
        }
      }

      return inv;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setInvModalOpen(false);
      setInvName('');
      setInvReason('');
      setInvNotes('');
      setSelectedLabId('');
    },
  });

  const createReferralMutation = useMutation({
    mutationFn: () =>
      doctorApi.createReferral(patientId, {
        specialty: refSpecialty,
        referredProvider: refProvider || undefined,
        reason: refReason,
        notes: refNotes || undefined,
        priority: refPriority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setReferralModalOpen(false);
      setRefSpecialty('');
      setRefProvider('');
      setRefReason('');
      setRefNotes('');
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: () =>
      doctorApi.createFollowUp(patientId, {
        dueDate: fuDate,
        reason: fuReason,
        instructions: fuInstructions || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setFollowUpModalOpen(false);
      setFuDate('');
      setFuReason('');
      setFuInstructions('');
    },
  });

  const updateFollowUpMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FollowUpStatus }) =>
      doctorApi.updateFollowUpStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
    },
  });

  const addFeedbackMutation = useMutation({
    mutationFn: () => {
      if (!feedbackDocId) return Promise.reject();
      return doctorApi.addDoctorFeedback(feedbackDocId, feedbackNotes, feedbackRecs || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
      setFeedbackDocId(null);
      setFeedbackNotes('');
      setFeedbackRecs('');
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Verifying clinical consent and loading patient vault..." />;
  }

  if (error || !workspace) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-left">
        <ErrorMessage
          title="Patient Workspace Access Denied"
          message={
            (error as any)?.message ||
            'You do not have active approved consent from this patient to view their medical vault.'
          }
        />
        <div className="mt-4">
          <Link href="/app/patients">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
              Back to Connected Patients
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { patient, access, documents, consultations, prescriptions, investigations, referrals, followUps, timeline } = workspace;

  return (
    <div className="space-y-6 text-left">
      {/* 1. Top Navigation & Patient Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/app/patients"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Back to patients"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {patient.fullName || patient.email}
              </h1>
              <Badge variant="success" size="sm" dot>
                {access.relationshipType?.replace('_', ' ') || 'Connected Patient'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {patient.gender || 'Unknown gender'} • DOB:{' '}
              {patient.dateOfBirth ? formatDate(patient.dateOfBirth) : 'Not specified'} • Blood Group:{' '}
              {patient.bloodGroup ? patient.bloodGroup.replace('_', ' ') : 'Unknown'} • City:{' '}
              {patient.city || 'India'}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setConsultModalOpen(true)}
            leftIcon={<ClipboardList className="h-3.5 w-3.5" />}
          >
            Record Consult
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRxModalOpen(true)}
            leftIcon={<Pill className="h-3.5 w-3.5 text-teal-700" />}
          >
            Issue Rx
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInvModalOpen(true)}
            leftIcon={<Microscope className="h-3.5 w-3.5 text-teal-700" />}
          >
            Order Test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFollowUpModalOpen(true)}
            leftIcon={<CalendarCheck className="h-3.5 w-3.5 text-teal-700" />}
          >
            Follow-up
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRequestConsentOpen(true)}
            leftIcon={<KeyRound className="h-3.5 w-3.5 text-teal-700" />}
          >
            Request Access
          </Button>
        </div>
      </div>

      {/* M3 Consent Status Indicator */}
      {activeConsent ? (
        <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-teal-950">Active Patient Consent</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${expiry?.badgeClass}`}>
                  {expiry?.text}
                </span>
              </div>
              <p className="text-teal-800 text-[11px] mt-0.5">
                Authorized scopes: {activeConsent.scopes.map((s) => formatResourceCategory(s.resourceCategory)).join(', ')}
                {activeConsent.scopes.some((s) => s.accessLevel === 'DOWNLOAD') ? ' • View & Download' : ' • View Only'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRequestConsentOpen(true)}
            className="bg-white shrink-0 text-xs"
          >
            Extend or Request Scopes
          </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-left">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-amber-950">Vault Access Requires Explicit Consent</span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Connecting as a physician does not provide automatic access to private diagnostic records. Request scoped consent from the patient.
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setRequestConsentOpen(true)}
            leftIcon={<KeyRound className="h-3.5 w-3.5" />}
            className="shrink-0 text-xs"
          >
            Request Record Access
          </Button>
        </div>
      )}

      {/* 2. Workspace Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto text-xs pb-px">
        {[
          { id: 'overview', label: 'Overview', icon: HeartPulse },
          { id: 'documents', label: `Documents (${documents.length})`, icon: FolderLock },
          { id: 'consultations', label: `Consultations (${consultations.length})`, icon: ClipboardList },
          { id: 'prescriptions', label: `Prescriptions (${prescriptions.length})`, icon: Pill },
          { id: 'investigations', label: `Investigations (${investigations.length})`, icon: Microscope },
          { id: 'followups', label: `Follow-ups (${followUps.length})`, icon: CalendarCheck },
          { id: 'timeline', label: 'Timeline', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 whitespace-nowrap transition-colors select-none ${
                isActive
                  ? 'border-teal-700 text-teal-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-teal-700' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): Clinical Background & Allergies */}
          <div className="lg:col-span-2 space-y-6">
            {/* Allergies & Alerts */}
            {patient.allergies && patient.allergies.length > 0 && (
              <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertCircle className="h-4 w-4" />
                  <span>Documented Patient Allergies & Adverse Reactions</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patient.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white border border-rose-200 font-semibold text-rose-700">
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Health Snapshot */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Medical Summary & Chronic Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Diagnosed / Known Conditions
                  </span>
                  {patient.knownConditions && patient.knownConditions.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.knownConditions.map((cond, i) => (
                        <Badge key={i} variant="brand" size="sm">
                          {cond}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No chronic conditions declared</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Current Medications
                  </span>
                  {patient.currentMedications && patient.currentMedications.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {patient.currentMedications.map((med, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-slate-100 text-slate-700 font-medium">
                          {med}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">No current medications recorded</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Past Surgeries & Procedures
                  </span>
                  {patient.pastSurgeries && patient.pastSurgeries.length > 0 ? (
                    <p className="text-slate-700">{patient.pastSurgeries.join(', ')}</p>
                  ) : (
                    <p className="text-slate-400 italic">None documented</p>
                  )}
                </div>

                {patient.importantMedicalHistory && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                      Important Medical History
                    </span>
                    <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                      {patient.importantMedicalHistory}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Clinical Encounters Preview */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent Consultations
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('consultations')}>
                  View all ({consultations.length})
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {consultations.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {consultations.slice(0, 3).map((c) => (
                      <div key={c.id} className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{c.reasonForVisit}</span>
                          <span className="text-[11px] text-slate-500">{formatDate(c.consultationDate)}</span>
                        </div>
                        <p className="text-slate-600 line-clamp-2">
                          <strong>Assessment:</strong> {c.assessment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No consultations recorded yet. Click &quot;Record Consult&quot; above to add one.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (1/3): Active Consent Scope & Emergency Info */}
          <div className="space-y-6">
            {/* Active Consent Scope Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-700" />
                  Active Consent Scope
                </CardTitle>
                <p className="text-xs text-slate-500">
                  Patient-controlled permissions governing this workspace.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="font-semibold text-slate-800">
                    {access.relationshipType?.replace('_', ' ') || 'Primary Physician'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Consent Granted:</span>
                  <span className="text-slate-700">{formatDate(access.grantedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Access Expiry:</span>
                  <span className="font-medium text-slate-800">
                    {access.expiresAt ? formatDate(access.expiresAt) : 'Ongoing clinical care'}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block mb-1 font-medium">Authorized Categories:</span>
                  <div className="flex flex-wrap gap-1">
                    {access.accessScope?.map((cat) => (
                      <span key={cat} className="px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-medium">
                        ✓ {formatCategory(cat as any)}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Name:</span>
                  <span className="font-medium text-slate-800">{patient.emergencyContactName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Relationship:</span>
                  <span className="text-slate-700">{patient.emergencyContactRelation || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="text-slate-700">{patient.emergencyContactPhone || 'Not specified'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB: DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Authorized Diagnostic Records & Reports
              </h2>
              <p className="text-xs text-slate-500">
                Medical scans and lab reports shared under approved patient consent.
              </p>
            </div>
          </div>

          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const latestVersion = doc.versions?.[0];
                const feedbackCount = doc.feedbacks?.length || 0;

                return (
                  <Card key={doc.id} className="hover:border-teal-700/40 transition-colors">
                    <CardContent className="p-4 space-y-3 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {doc.metadata?.reportTitle || formatCategory(doc.category)}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Category: {formatCategory(doc.category)} • Date:{' '}
                            {formatDate(doc.metadata?.documentDate || doc.createdAt)}
                          </p>
                        </div>
                        <Badge variant="neutral" size="sm">
                          {latestVersion?.mimeType || 'Document'}
                        </Badge>
                      </div>

                      {doc.metadata?.rawOcrText && (
                        <div className="p-2.5 rounded bg-slate-50 border border-slate-100 font-mono text-[11px] text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap">
                          {doc.metadata.rawOcrText}
                        </div>
                      )}

                      {/* Clinician Feedbacks Preview */}
                      {feedbackCount > 0 && (
                        <div className="p-2 rounded bg-teal-50/60 border border-teal-100 text-[11px] text-teal-950 space-y-1">
                          <span className="font-semibold block">Clinician Assessments ({feedbackCount}):</span>
                          <p className="text-teal-800 line-clamp-2">
                            {doc.feedbacks![0].notes}
                          </p>
                        </div>
                      )}

                      {/* Lab Report View-Only Notice */}
                      {doc.category === 'LAB_REPORT' && (
                        <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex items-center gap-1.5">
                          <Lock className="h-3 w-3 shrink-0" />
                          <span>Clinician View-Only Access — Direct download restricted.</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {doc.signedUrl && doc.category !== 'LAB_REPORT' ? (
                          <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" leftIcon={<ExternalLink className="h-3 w-3" />}>
                              View Source File
                            </Button>
                          </a>
                        ) : doc.category === 'LAB_REPORT' ? (
                          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Audit View Mode
                          </span>
                        ) : null}

                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => {
                            setFeedbackDocId(doc.id);
                            setFeedbackNotes('');
                            setFeedbackRecs('');
                          }}
                          leftIcon={<Stethoscope className="h-3 w-3" />}
                        >
                          Add Feedback
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No authorized documents found in this patient&apos;s vault.
            </div>
          )}
        </div>
      )}

      {/* TAB: CONSULTATIONS */}
      {activeTab === 'consultations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Clinical Consultations
              </h2>
              <p className="text-xs text-slate-500">
                Examination notes, clinical diagnoses, and care plans recorded for this patient.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setConsultModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              New Consultation
            </Button>
          </div>

          {consultations.length > 0 ? (
            <div className="space-y-4">
              {consultations.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {c.reasonForVisit}
                      </CardTitle>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Consultation Date: {formatDate(c.consultationDate)}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Chief Complaint:</span>
                      <p className="text-slate-800">{c.chiefComplaint}</p>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-700 block mb-0.5">Clinical Examination & Notes:</span>
                      <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{c.clinicalNotes}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-teal-50/50 border border-teal-100 space-y-2">
                      <div>
                        <span className="font-bold text-teal-950 block">Assessment & Clinical Impression:</span>
                        <p className="text-teal-900">{c.assessment}</p>
                      </div>
                      <div>
                        <span className="font-bold text-teal-950 block">Management & Treatment Plan:</span>
                        <p className="text-teal-900 leading-relaxed">{c.plan}</p>
                      </div>
                    </div>

                    {c.followUpDate && (
                      <div className="flex items-center gap-2 pt-1 text-slate-600">
                        <CalendarCheck className="h-3.5 w-3.5 text-teal-700" />
                        <span>Recommended Follow-up: <strong>{formatDate(c.followUpDate)}</strong> ({c.followUpInstructions || 'Routine'})</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No consultations recorded yet. Click &quot;New Consultation&quot; to begin.
            </div>
          )}
        </div>
      )}

      {/* TAB: PRESCRIPTIONS */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Prescriptions Issued
              </h2>
              <p className="text-xs text-slate-500">
                Formally issued medications, dosages, and administration instructions.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setRxModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Issue Prescription
            </Button>
          </div>

          {prescriptions.length > 0 ? (
            <div className="space-y-4">
              {prescriptions.map((rx) => (
                <Card key={rx.id}>
                  <CardHeader className="border-b border-slate-100 pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Prescription • {formatDate(rx.prescriptionDate)}
                      </CardTitle>
                      {rx.notes && <p className="text-xs text-slate-500 mt-0.5">{rx.notes}</p>}
                    </div>
                    <Badge variant="brand" size="sm">
                      {rx.items?.length || 0} Medications
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="py-2.5 px-4">Medicine</th>
                          <th className="py-2.5 px-4">Dosage</th>
                          <th className="py-2.5 px-4">Frequency</th>
                          <th className="py-2.5 px-4">Duration</th>
                          <th className="py-2.5 px-4">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.items?.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="py-2.5 px-4 font-bold text-slate-900">{item.medicineName}</td>
                            <td className="py-2.5 px-4 font-medium text-slate-800">{item.dosage}</td>
                            <td className="py-2.5 px-4 text-slate-700">{item.frequency}</td>
                            <td className="py-2.5 px-4 text-slate-700">{item.duration}</td>
                            <td className="py-2.5 px-4 text-slate-600">{item.instructions || 'As advised'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No prescriptions issued yet. Click &quot;Issue Prescription&quot; to write one.
            </div>
          )}
        </div>
      )}

      {/* TAB: INVESTIGATIONS */}
      {activeTab === 'investigations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Investigation Requests
              </h2>
              <p className="text-xs text-slate-500">
                Diagnostic laboratory tests and imaging studies requested for this patient.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setInvModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Order Investigation
            </Button>
          </div>

          {investigations.length > 0 ? (
            <div className="space-y-3">
              {investigations.map((inv) => (
                <Card key={inv.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{inv.investigationName}</span>
                        <Badge
                          variant={inv.priority === 'URGENT' || inv.priority === 'STAT' ? 'error' : 'neutral'}
                          size="sm"
                        >
                          {inv.priority}
                        </Badge>
                        <Badge variant="brand" size="sm">
                          {inv.category}
                        </Badge>
                      </div>
                      <p className="text-slate-600">
                        <strong>Clinical Reason:</strong> {inv.reason}
                      </p>
                      {inv.notes && <p className="text-slate-500 text-[11px]">{inv.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={inv.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                        {inv.status}
                      </Badge>
                      <span className="text-[11px] text-slate-400">{formatDate(inv.requestedDate)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No investigation requests logged. Click &quot;Order Investigation&quot; to request a diagnostic test.
            </div>
          )}
        </div>
      )}

      {/* TAB: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Follow-up Schedule
              </h2>
              <p className="text-xs text-slate-500">
                Scheduled review dates and clinical guidance for patient check-ins.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setFollowUpModalOpen(true)}
              leftIcon={<Plus className="h-3.5 w-3.5" />}
            >
              Schedule Follow-up
            </Button>
          </div>

          {followUps.length > 0 ? (
            <div className="space-y-3">
              {followUps.map((fu) => (
                <Card key={fu.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{fu.reason}</span>
                        <Badge
                          variant={
                            fu.status === 'COMPLETED'
                              ? 'success'
                              : fu.status === 'MISSED'
                              ? 'error'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {fu.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600">
                        Due Date: <strong>{formatDate(fu.dueDate)}</strong>
                      </p>
                      {fu.instructions && (
                        <p className="text-slate-500 text-[11px]">{fu.instructions}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {fu.status === 'UPCOMING' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateFollowUpMutation.mutate({ id: fu.id, status: 'COMPLETED' })
                          }
                        >
                          Mark Completed
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 bg-slate-50 rounded-lg border border-slate-200">
              No follow-ups scheduled. Click &quot;Schedule Follow-up&quot; to set one.
            </div>
          )}
        </div>
      )}

      {/* TAB: TIMELINE */}
      {activeTab === 'timeline' && (
        <TimelineContainer
          patientId={patientId}
          isDoctorView={true}
          patientName={patient?.fullName || patient?.email}
          consentExpiresAt={access?.expiresAt}
        />
      )}

      {/* 4. MODALS */}

      {/* Consultation Modal */}
      <Dialog
        isOpen={consultModalOpen}
        onClose={() => setConsultModalOpen(false)}
        title="Record Clinical Consultation"
        description="Add examination findings, clinical assessment, and treatment plan."
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <Input
            label="Reason for Visit *"
            required
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            placeholder="e.g. Type 2 Diabetes follow-up / chest discomfort"
          />

          <Input
            label="Chief Complaint *"
            required
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
            placeholder="e.g. Occasional dizziness and fatigue for past 2 weeks"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Examination & Observations *
            </label>
            <textarea
              rows={3}
              required
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Physical examination, vitals, system review..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Assessment / Diagnosis *
              </label>
              <textarea
                rows={3}
                required
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                placeholder="Clinical assessment and diagnostic conclusion..."
                className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Treatment & Management Plan *
              </label>
              <textarea
                rows={3}
                required
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                placeholder="Medication adjustments, lifestyle modifications..."
                className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <Input
              label="Recommended Follow-up Date"
              type="date"
              value={consultFollowUpDate}
              onChange={(e) => setConsultFollowUpDate(e.target.value)}
            />
            <Input
              label="Follow-up Instructions"
              value={consultFollowUpInstructions}
              onChange={(e) => setConsultFollowUpInstructions(e.target.value)}
              placeholder="e.g. Fasting blood sugar report prior to visit"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConsultModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!reasonForVisit.trim() || !chiefComplaint.trim() || !clinicalNotes.trim() || !assessment.trim() || !plan.trim()}
              isLoading={createConsultMutation.isPending}
              onClick={() => createConsultMutation.mutate()}
            >
              Save Consultation Note
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Prescription Modal */}
      <Dialog
        isOpen={rxModalOpen}
        onClose={() => setRxModalOpen(false)}
        title="Issue Prescription"
        description="Add medication items with dosage, frequency, and instructions."
        maxWidth="lg"
      >
        <div className="space-y-4 text-left">
          <Input
            label="General Clinical Notes / Indication"
            value={rxNotes}
            onChange={(e) => setRxNotes(e.target.value)}
            placeholder="e.g. Acute exacerbation management"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Prescribed Medications
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setRxItems([
                    ...rxItems,
                    { medicineName: '', dosage: '', frequency: 'Twice daily', duration: '5 days', instructions: 'After food' },
                  ])
                }
                leftIcon={<Plus className="h-3 w-3" />}
              >
                Add Medication
              </Button>
            </div>

            {rxItems.map((item, index) => (
              <div key={index} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Input
                    label="Medicine Name *"
                    required
                    value={item.medicineName}
                    onChange={(e) => {
                      const copy = [...rxItems];
                      copy[index].medicineName = e.target.value;
                      setRxItems(copy);
                    }}
                    placeholder="e.g. Metformin"
                  />
                  <Input
                    label="Dosage *"
                    required
                    value={item.dosage}
                    onChange={(e) => {
                      const copy = [...rxItems];
                      copy[index].dosage = e.target.value;
                      setRxItems(copy);
                    }}
                    placeholder="e.g. 500 mg"
                  />
                  <Input
                    label="Frequency *"
                    required
                    value={item.frequency}
                    onChange={(e) => {
                      const copy = [...rxItems];
                      copy[index].frequency = e.target.value;
                      setRxItems(copy);
                    }}
                    placeholder="e.g. Once daily / Twice daily"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    label="Duration *"
                    required
                    value={item.duration}
                    onChange={(e) => {
                      const copy = [...rxItems];
                      copy[index].duration = e.target.value;
                      setRxItems(copy);
                    }}
                    placeholder="e.g. 30 days"
                  />
                  <Input
                    label="Instructions"
                    value={item.instructions}
                    onChange={(e) => {
                      const copy = [...rxItems];
                      copy[index].instructions = e.target.value;
                      setRxItems(copy);
                    }}
                    placeholder="e.g. Take with dinner"
                  />
                </div>

                {rxItems.length > 1 && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRxItems(rxItems.filter((_, i) => i !== index))}
                      className="text-[11px] text-rose-600 hover:underline"
                    >
                      Remove item
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setRxModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={rxItems.some((i) => !i.medicineName.trim() || !i.dosage.trim())}
              isLoading={createRxMutation.isPending}
              onClick={() => createRxMutation.mutate()}
            >
              Issue Prescription
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Investigation Modal */}
      <Dialog
        isOpen={invModalOpen}
        onClose={() => setInvModalOpen(false)}
        title="Order Diagnostic Investigation"
        description="Request a laboratory test or imaging study."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <Input
            label="Investigation Name *"
            required
            value={invName}
            onChange={(e) => setInvName(e.target.value)}
            placeholder="e.g. Complete Blood Count (CBC) / Chest X-Ray"
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={invCategory}
              onChange={(e) => setInvCategory(e.target.value)}
              options={[
                { label: 'Laboratory Test', value: 'LABORATORY' },
                { label: 'Diagnostic Imaging', value: 'IMAGING' },
                { label: 'Other Study', value: 'OTHER' },
              ]}
            />

            <Select
              label="Priority"
              value={invPriority}
              onChange={(e) => setInvPriority(e.target.value)}
              options={[
                { label: 'Routine', value: 'ROUTINE' },
                { label: 'Urgent', value: 'URGENT' },
                { label: 'STAT', value: 'STAT' },
              ]}
            />
          </div>

          {invCategory === 'LABORATORY' && (
            <Select
              label="Assign Diagnostic Laboratory (Optional)"
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              options={[
                { label: 'None / Patient Choice', value: '' },
                ...(verifiedLabs || []).map((lab) => ({
                  label: `${lab.name} (${lab.city || 'Verified Facility'})`,
                  value: lab.id,
                })),
              ]}
            />
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Reason / Indication *
            </label>
            <textarea
              rows={3}
              required
              value={invReason}
              onChange={(e) => setInvReason(e.target.value)}
              placeholder="Clinical suspicion, symptoms, baseline monitoring..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <Input
            label="Special Instructions (Optional)"
            value={invNotes}
            onChange={(e) => setInvNotes(e.target.value)}
            placeholder="e.g. 12-hour fasting required"
          />

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInvModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!invName.trim() || !invReason.trim()}
              isLoading={createInvMutation.isPending}
              onClick={() => createInvMutation.mutate()}
            >
              Order Investigation
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Follow-up Modal */}
      <Dialog
        isOpen={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        title="Schedule Clinical Follow-up"
        description="Set review date and instructions for patient."
        maxWidth="sm"
      >
        <div className="space-y-4 text-left">
          <Input
            label="Follow-up Date *"
            type="date"
            required
            value={fuDate}
            onChange={(e) => setFuDate(e.target.value)}
          />

          <Input
            label="Clinical Reason *"
            required
            value={fuReason}
            onChange={(e) => setFuReason(e.target.value)}
            placeholder="e.g. Evaluate glycemic control & lab results"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Patient Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={fuInstructions}
              onChange={(e) => setFuInstructions(e.target.value)}
              placeholder="e.g. Bring fasting blood sugar log"
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setFollowUpModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!fuDate || !fuReason.trim()}
              isLoading={createFollowUpMutation.isPending}
              onClick={() => createFollowUpMutation.mutate()}
            >
              Confirm Schedule
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Document Feedback Modal */}
      <Dialog
        isOpen={!!feedbackDocId}
        onClose={() => setFeedbackDocId(null)}
        title="Add Clinical Assessment & Guidance"
        description="Provide physician observations on this document. Original file remains immutable."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Assessment & Findings *
            </label>
            <textarea
              rows={4}
              required
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Enter clinical interpretation of laboratory parameters or imaging scan..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Recommended Next Steps (Optional)
            </label>
            <textarea
              rows={2}
              value={feedbackRecs}
              onChange={(e) => setFeedbackRecs(e.target.value)}
              placeholder="e.g. Repeat lipid panel in 6 weeks"
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setFeedbackDocId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!feedbackNotes.trim()}
              isLoading={addFeedbackMutation.isPending}
              onClick={() => addFeedbackMutation.mutate()}
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </Dialog>

      {/* M3 Consent Request Modal */}
      <RequestConsentModal
        isOpen={requestConsentOpen}
        onClose={() => setRequestConsentOpen(false)}
        preselectedPatientId={patientId}
        preselectedPatientName={patient?.fullName}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['patient-workspace', patientId] });
          queryClient.invalidateQueries({ queryKey: ['patient-consent', patientId] });
        }}
      />
    </div>
  );
}
