import { api } from './client';
import { HealthTimelineEvent, MedicalDocument, PatientProfile } from './types';

export type DoctorVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type FollowUpStatus = 'UPCOMING' | 'COMPLETED' | 'MISSED' | 'CANCELLED';

export interface DoctorProfile {
  id: string;
  userId: string;
  fullName: string;
  profilePhoto?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  mobile?: string | null;
  specialization?: string | null;
  subSpecialty?: string | null;
  qualifications?: string | null;
  languages?: string[];
  yearsOfExperience?: number;
  licenseNumber?: string | null;
  registrationNumber?: string | null;
  registrationAuthority?: string | null;
  registrationState?: string | null;
  registrationCountry?: string | null;
  clinicName?: string | null;
  clinicAddress?: string | null;
  city?: string | null;
  consultationMode?: string | null;
  consultationFee?: string | null;
  workingHours?: string | null;
  hospitalAffiliation?: string | null;
  bio?: string | null;
  medicalCertificate?: string | null;
  education?: string | null;
  verificationStatus: DoctorVerificationStatus;
  verificationNotes?: string | null;
  rejectionReason?: string | null;
  verificationSubmittedAt?: string | null;
  verifiedAt?: string | null;
  averageRating?: number;
  reviewCount?: number;
}

export interface DoctorReview {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  patientName: string;
}

export interface DoctorShowcase extends DoctorProfile {
  email: string;
  reviews: DoctorReview[];
}

export interface DoctorAccessRequest {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED';
  notes?: string | null;
  relationshipType?: string;
  accessScope?: string[];
  expiresAt?: string | null;
  requestedBy: 'DOCTOR' | 'PATIENT';
  requestedAt: string;
  respondedAt?: string | null;
  patient?: {
    id: string;
    email: string;
    patientProfile?: PatientProfile | null;
  };
  doctor?: {
    id: string;
    email: string;
    doctorProfile?: DoctorProfile | null;
  };
}

export interface AssignedPatient {
  accessId: string;
  patientId: string;
  relationshipType?: string;
  accessScope?: string[];
  expiresAt?: string | null;
  grantedAt: string;
  patient: PatientProfile & {
    email: string;
    phone?: string | null;
    totalDocuments: number;
  };
  clinicalSnapshot?: {
    pendingReportsCount: number;
    lastConsultationDate?: string | null;
    lastConsultationReason?: string | null;
    nextFollowUpDate?: string | null;
    nextFollowUpReason?: string | null;
  };
}

export interface DoctorFeedback {
  id: string;
  documentId: string;
  doctorId: string;
  notes: string;
  recommendations?: string | null;
  isReviewed?: boolean;
  reviewedAt?: string;
  createdAt: string;
  doctor: {
    id: string;
    doctorProfile?: {
      fullName: string;
      specialization?: string | null;
      hospitalAffiliation?: string | null;
    } | null;
  };
}

export interface Consultation {
  id: string;
  patientId: string;
  doctorId: string;
  consultationDate: string;
  reasonForVisit: string;
  chiefComplaint: string;
  clinicalNotes: string;
  assessment: string;
  plan: string;
  followUpDate?: string | null;
  followUpInstructions?: string | null;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  additionalNotes?: string | null;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  consultationId?: string | null;
  prescriptionDate: string;
  notes?: string | null;
  items: PrescriptionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvestigationRequest {
  id: string;
  patientId: string;
  doctorId: string;
  investigationName?: string;
  testName?: string;
  category?: string;
  reason?: string;
  clinicalReason?: string;
  priority: string;
  status: string;
  notes?: string | null;
  instructions?: string | null;
  requestedDate?: string;
  createdAt: string;
  updatedAt?: string;
  doctor?: any;
  patient?: any;
  labOrder?: any;
}

export interface Referral {
  id: string;
  patientId: string;
  doctorId: string;
  specialty: string;
  referredProvider?: string | null;
  reason: string;
  notes?: string | null;
  priority: string;
  status: string;
  referralDate: string;
  createdAt: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  doctorId: string;
  dueDate: string;
  reason: string;
  instructions?: string | null;
  status: FollowUpStatus;
  completedAt?: string | null;
  patient?: {
    id: string;
    email: string;
    patientProfile?: PatientProfile | null;
  };
  createdAt: string;
}

export interface DoctorDashboardData {
  metrics: {
    activePatientsCount: number;
    todayConsultationsCount: number;
    reportsAwaitingReviewCount: number;
    followUpsDueCount: number;
    pendingRequestsCount: number;
  };
  todayConsultations: Consultation[];
  followUpsDue: FollowUp[];
  reportsAwaitingReview: MedicalDocument[];
  recentActivity: HealthTimelineEvent[];
  pendingActions: Array<{
    id: string;
    type: 'REVIEW_REPORT' | 'FOLLOW_UP_DUE' | 'RESPOND_REQUEST' | 'CONSULTATION_INCOMPLETE';
    title: string;
    description: string;
    patientName: string;
    patientId: string;
    targetId?: string;
    dueDate?: string;
  }>;
}

export interface PatientWorkspace {
  patient: PatientProfile & {
    id: string;
    email: string;
    phone?: string | null;
  };
  access: {
    id: string;
    status: string;
    relationshipType: string;
    accessScope: string[];
    expiresAt?: string | null;
    grantedAt: string;
  };
  documents: MedicalDocument[];
  consultations: Consultation[];
  prescriptions: Prescription[];
  investigations: InvestigationRequest[];
  referrals: Referral[];
  followUps: FollowUp[];
  timeline: HealthTimelineEvent[];
}

export interface UpdateDoctorProfilePayload {
  fullName?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  mobile?: string;
  specialization?: string;
  subSpecialty?: string;
  qualifications?: string;
  languages?: string[];
  yearsOfExperience?: number;
  licenseNumber?: string;
  registrationNumber?: string;
  registrationAuthority?: string;
  registrationState?: string;
  registrationCountry?: string;
  clinicName?: string;
  clinicAddress?: string;
  city?: string;
  consultationMode?: string;
  workingHours?: string;
  hospitalAffiliation?: string;
  bio?: string;
  medicalCertificate?: string;
  education?: string;
  consultationFee?: string;
}

export const doctorApi = {
  // Clinical Dashboard
  getDoctorDashboard: () =>
    api.get<DoctorDashboardData>('/doctor/dashboard'),

  // Access requests & Consent
  requestAccess: (patientEmail: string, notes?: string) =>
    api.post<{ message: string; request: DoctorAccessRequest }>('/doctor/access-requests', {
      patientEmail,
      notes,
    }),

  getDoctorAccessRequests: () =>
    api.get<DoctorAccessRequest[]>('/doctor/access-requests'),

  getDoctorAssignedPatients: (search?: string) =>
    api.get<AssignedPatient[]>(`/doctor/patients${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  getPatientWorkspace: (patientId: string) =>
    api.get<PatientWorkspace>(`/doctor/patients/${patientId}/workspace`),

  getConsentedPatientDocuments: (patientId: string) =>
    api.get<{ patient: PatientProfile; documents: MedicalDocument[] }>(
      `/doctor/patients/${patientId}/documents`,
    ),

  getAuthorizedDocument: (documentId: string) =>
    api.get<MedicalDocument>(`/doctor/documents/${documentId}`),

  getReportsAwaitingReview: () =>
    api.get<MedicalDocument[]>('/doctor/reports/awaiting-review'),

  addDoctorFeedback: (documentId: string, notes: string, recommendations?: string) =>
    api.post<{ message: string; feedback: DoctorFeedback }>(
      `/doctor/documents/${documentId}/feedback`,
      { notes, recommendations },
    ),

  getDocumentFeedback: (documentId: string) =>
    api.get<DoctorFeedback[]>(`/documents/${documentId}/feedback`),

  // Consultations
  createConsultation: (
    patientId: string,
    data: {
      consultationDate?: string;
      reasonForVisit: string;
      chiefComplaint: string;
      clinicalNotes: string;
      assessment: string;
      plan: string;
      followUpDate?: string;
      followUpInstructions?: string;
      attachments?: string[];
    },
  ) =>
    api.post<{ message: string; consultation: Consultation }>(
      `/doctor/patients/${patientId}/consultations`,
      data,
    ),

  getPatientConsultations: (patientId: string) =>
    api.get<Consultation[]>(`/doctor/patients/${patientId}/consultations`),

  getConsultationById: (id: string) =>
    api.get<Consultation>(`/doctor/consultations/${id}`),

  updateConsultation: (id: string, data: Partial<Consultation>) =>
    api.patch<{ message: string; consultation: Consultation }>(
      `/doctor/consultations/${id}`,
      data,
    ),

  // Prescriptions
  createPrescription: (
    patientId: string,
    data: {
      consultationId?: string;
      prescriptionDate?: string;
      notes?: string;
      items: Array<{
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
        additionalNotes?: string;
      }>;
    },
  ) =>
    api.post<{ message: string; prescription: Prescription }>(
      `/doctor/patients/${patientId}/prescriptions`,
      data,
    ),

  getPatientPrescriptions: (patientId: string) =>
    api.get<Prescription[]>(`/doctor/patients/${patientId}/prescriptions`),

  getPrescriptionById: (id: string) =>
    api.get<Prescription>(`/doctor/prescriptions/${id}`),

  // Investigations
  createInvestigation: (
    patientId: string,
    data: {
      investigationName: string;
      category?: string;
      reason: string;
      priority?: string;
      notes?: string;
    },
  ) =>
    api.post<{ message: string; investigation: InvestigationRequest }>(
      `/doctor/patients/${patientId}/investigations`,
      data,
    ),

  getPatientInvestigations: (patientId: string) =>
    api.get<InvestigationRequest[]>(`/doctor/patients/${patientId}/investigations`),

  updateInvestigationStatus: (id: string, status: string) =>
    api.patch<{ message: string; investigation: InvestigationRequest }>(
      `/doctor/investigations/${id}/status`,
      { status },
    ),

  // Referrals
  createReferral: (
    patientId: string,
    data: {
      specialty: string;
      referredProvider?: string;
      reason: string;
      notes?: string;
      priority?: string;
    },
  ) =>
    api.post<{ message: string; referral: Referral }>(
      `/doctor/patients/${patientId}/referrals`,
      data,
    ),

  getPatientReferrals: (patientId: string) =>
    api.get<Referral[]>(`/doctor/patients/${patientId}/referrals`),

  // Follow-ups
  createFollowUp: (
    patientId: string,
    data: {
      dueDate: string;
      reason: string;
      instructions?: string;
    },
  ) =>
    api.post<{ message: string; followUp: FollowUp }>(
      `/doctor/patients/${patientId}/follow-ups`,
      data,
    ),

  getPatientFollowUps: (patientId: string) =>
    api.get<FollowUp[]>(`/doctor/patients/${patientId}/follow-ups`),

  getDoctorFollowUps: () =>
    api.get<FollowUp[]>('/doctor/follow-ups'),

  updateFollowUpStatus: (id: string, status: FollowUpStatus) =>
    api.patch<{ message: string; followUp: FollowUp }>(
      `/doctor/follow-ups/${id}/status`,
      { status },
    ),

  // Doctor Profile & Verification
  getDoctorProfile: () =>
    api.get<DoctorProfile>('/doctor/profile'),

  updateDoctorProfile: (payload: UpdateDoctorProfilePayload) =>
    api.patch<{ message: string; profile: DoctorProfile }>('/doctor/profile', payload),

  submitForVerification: () =>
    api.post<{ message: string; profile: DoctorProfile }>('/doctor/verification/submit', {}),

  // Doctor Activity
  getDoctorActivity: () =>
    api.get<any[]>('/doctor/activity'),

  // Public / Patient operations
  listDoctors: () =>
    api.get<DoctorProfile[]>('/doctors'),

  getDoctorShowcase: (doctorId: string) =>
    api.get<DoctorShowcase>(`/doctors/${doctorId}`),

  getPatientAccessRequests: () =>
    api.get<DoctorAccessRequest[]>('/patients/me/access-requests'),

  respondAccessRequest: (id: string, status: 'APPROVED' | 'REJECTED' | 'REVOKED') =>
    api.patch<{ message: string; access: DoctorAccessRequest }>(
      `/patients/me/access-requests/${id}/respond`,
      { status },
    ),

  assignDoctor: (doctorId: string, notes?: string) =>
    api.post<{ message: string; access: DoctorAccessRequest }>('/patients/me/assign-doctor', {
      doctorId,
      notes,
    }),

  addDoctorReview: (doctorId: string, rating: number, comment?: string) =>
    api.post<{ message: string; review: any }>(`/doctors/${doctorId}/reviews`, {
      rating,
      comment,
    }),

  // Admin operations
  listDoctorVerifications: (status?: string) =>
    api.get<import('./types').DoctorVerificationItem[]>(
      `/admin/doctor-verifications${status && status !== 'ALL' ? `?status=${status}` : ''}`,
    ),

  reviewDoctorVerification: (
    doctorId: string,
    status: DoctorVerificationStatus,
    notes?: string,
    reason?: string,
  ) =>
    api.patch<{ message: string; profile: any }>(`/doctor/verification/${doctorId}/review`, {
      status,
      notes,
      reason,
    }),
};
