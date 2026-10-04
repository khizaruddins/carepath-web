export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN' | 'LAB';
export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'DEACTIVATED';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
export type BloodGroup =
  | 'A_POSITIVE'
  | 'A_NEGATIVE'
  | 'B_POSITIVE'
  | 'B_NEGATIVE'
  | 'AB_POSITIVE'
  | 'AB_NEGATIVE'
  | 'O_POSITIVE'
  | 'O_NEGATIVE'
  | 'UNKNOWN';

export type DocumentCategory =
  | 'LAB_REPORT'
  | 'PRESCRIPTION'
  | 'CONSULTATION'
  | 'DISCHARGE_SUMMARY'
  | 'IMAGING_REPORT'
  | 'XRAY'
  | 'CT'
  | 'MRI'
  | 'OTHER';

export type DocumentProcessingStatus =
  | 'UPLOADED'
  | 'SCANNING'
  | 'PROCESSING_OCR'
  | 'READY'
  | 'FAILED';

export type OcrStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'CONFIRMED';

export type TimelineEventType =
  | 'DOCUMENT'
  | 'CONSULTATION'
  | 'PRESCRIPTION'
  | 'INVESTIGATION'
  | 'REFERRAL'
  | 'FOLLOW_UP'
  | 'APPOINTMENT'
  | 'LAB_RESULT'
  | 'IMAGING'
  | 'PROCEDURE'
  | 'HOSPITALIZATION'
  | 'NOTE'
  | 'VACCINATION'
  | 'ALLERGY'
  | 'DOCUMENT_UPLOADED'
  | 'DOCUMENT_UPDATED'
  | 'REPORT_ADDED'
  | 'PRESCRIPTION_ADDED'
  | 'CONSULTATION_ADDED'
  | 'INVESTIGATION_REQUESTED'
  | 'REFERRAL_CREATED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'OTHER';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_DOWNLOAD'
  | 'DOCUMENT_UPDATE'
  | 'DOCUMENT_DELETE'
  | 'PROFILE_VIEW'
  | 'PROFILE_UPDATE'
  | 'PASSWORD_CHANGE'
  | 'SECURITY_EVENT'
  | 'USER_REGISTER'
  | 'REFRESH_TOKEN'
  | 'CREATE_CONSENT'
  | 'APPROVE_CONSENT'
  | 'DECLINE_CONSENT'
  | 'REVOKE_CONSENT'
  | 'EXPIRE_CONSENT'
  | 'CANCEL_CONSENT'
  | 'VIEW_CONSENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  patientProfile?: PatientProfile;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  mobile?: string | null;
  email?: string | null;
  city?: string | null;
  bloodGroup?: BloodGroup | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelation?: string | null;
  knownConditions: string[];
  allergies: string[];
  currentMedications: string[];
  pastSurgeries: string[];
  importantMedicalHistory?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionNumber: number;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  createdAt: string;
}

export interface DocumentMetadata {
  id: string;
  documentId: string;
  documentType: DocumentCategory;
  documentDate?: string | null;
  providerName?: string | null;
  facility?: string | null;
  reportTitle?: string | null;
  patientNotes?: string | null;
  prescribedDoctorId?: string | null;
  ocrStatus: OcrStatus;
  rawOcrText?: string | null;
  extractedData?: {
    reportTitle?: string;
    providerName?: string;
    facility?: string;
    documentDate?: string;
    documentCategory?: string;
    findingsSummary?: string;
    parameters?: Array<{
      name: string;
      value: string;
      unit?: string;
      referenceRange?: string;
    }>;
  } | null;
  isPatientConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  uploadedById: string;
  category: DocumentCategory;
  status: DocumentProcessingStatus;
  isArchived: boolean;
  restoreRequested?: boolean;
  restoreStatus?: RestoreRequestStatus;
  restoreReason?: string | null;
  restoreRequestedAt?: string | null;
  downloadProhibited?: boolean;
  accessMode?: 'VIEW_ONLY' | 'FULL';
  createdAt: string;
  updatedAt: string;
  metadata?: DocumentMetadata;
  versions?: DocumentVersion[];
  signedUrl?: string;
  signedUrlExpiresInSeconds?: number;
  feedbacks?: any[];
}

export type RestoreRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export type DoctorVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export interface DoctorVerificationItem {
  id: string;
  email: string;
  status: UserStatus;
  phoneNumber?: string | null;
  createdAt: string;
  doctorProfile?: {
    id: string;
    fullName: string;
    specialization?: string | null;
    subSpecialty?: string | null;
    qualifications?: string | null;
    licenseNumber?: string | null;
    registrationNumber?: string | null;
    registrationAuthority?: string | null;
    registrationState?: string | null;
    registrationCountry?: string | null;
    hospitalAffiliation?: string | null;
    bio?: string | null;
    yearsOfExperience?: number;
    medicalCertificate?: string | null;
    education?: string | null;
    consultationFee?: string | null;
    clinicName?: string | null;
    clinicAddress?: string | null;
    city?: string | null;
    verificationStatus: DoctorVerificationStatus;
    verificationNotes?: string | null;
    rejectionReason?: string | null;
    verificationSubmittedAt?: string | null;
    verifiedAt?: string | null;
  } | null;
}

export interface DocumentRestoreRequestItem {
  id: string;
  documentId: string;
  patientId: string;
  status: RestoreRequestStatus;
  reason?: string | null;
  reviewedById?: string | null;
  adminNotes?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  document?: MedicalDocument;
  patient?: {
    id: string;
    email: string;
    phoneNumber?: string | null;
    patientProfile?: {
      fullName: string;
      mobile?: string | null;
    } | null;
  };
  reviewedBy?: {
    id: string;
    email: string;
    adminProfile?: {
      fullName: string;
    } | null;
  };
}

export type TimelineSourceType =
  | 'DOCUMENT'
  | 'CONSULTATION'
  | 'PRESCRIPTION'
  | 'INVESTIGATION'
  | 'REFERRAL'
  | 'FOLLOW_UP'
  | 'APPOINTMENT'
  | 'LAB_RESULT'
  | 'IMAGING'
  | 'PROCEDURE'
  | 'HOSPITALIZATION'
  | 'OTHER';

export type TimelineDatePrecision = 'EXACT' | 'DAY' | 'MONTH' | 'YEAR' | 'UNKNOWN';

export type TimelineVisibility = 'SHARED' | 'PATIENT_ONLY' | 'CLINICIAN_ONLY';

export interface TimelineGroupingMetadata {
  year: number;
  month: number;
  monthLabel: string;
  dayLabel: string;
}

export interface TimelineEventItem {
  id: string;
  patientId: string;
  eventType: TimelineEventType;
  eventDate: string;
  datePrecision: TimelineDatePrecision;
  title: string;
  summary: string | null;
  description?: string | null;
  source: {
    type: TimelineSourceType;
    id: string;
  };
  providerId?: string | null;
  providerName?: string | null;
  visibility: TimelineVisibility;
  grouping: TimelineGroupingMetadata;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export interface TimelineResponse {
  items: TimelineEventItem[];
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
  events?: TimelineEventItem[];
  limit?: number;
  offset?: number;
}

export interface TimelineEventDetails {
  event: TimelineEventItem;
  resolvedSource: {
    sourceType: TimelineSourceType;
    sourceId: string;
    sourceData: Record<string, any>;
  } | null;
}

export interface HealthTimelineEvent {
  id: string;
  patientId: string;
  documentId?: string | null;
  eventType: TimelineEventType;
  eventDate: string;
  title: string;
  description?: string | null;
  metadata?: Record<string, any> | null;
  document?: {
    id: string;
    category: DocumentCategory;
    status: DocumentProcessingStatus;
    metadata?: {
      reportTitle?: string;
      providerName?: string;
      facility?: string;
      documentDate?: string;
    };
  };
}

export interface AuditLog {
  id: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  result: 'SUCCESS' | 'FAILURE' | 'DENIED';
  ipAddress?: string | null;
  userAgent?: string | null;
  details?: Record<string, any> | null;
  timestamp: string;
}

export type ConsentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'DECLINED'
  | 'REVOKED'
  | 'EXPIRED'
  | 'CANCELLED';

export type ConsentPurpose =
  | 'REVIEW_RECENT_REPORTS'
  | 'FOLLOW_UP_CARE'
  | 'SECOND_OPINION'
  | 'CONSULTATION'
  | 'INVESTIGATION_REVIEW'
  | 'ONGOING_CARE'
  | 'OTHER';

export type ConsentResourceType =
  | 'DOCUMENT'
  | 'TIMELINE'
  | 'CONSULTATION'
  | 'PRESCRIPTION'
  | 'INVESTIGATION'
  | 'REFERRAL'
  | 'FOLLOW_UP'
  | 'PROFILE';

export type ConsentAccessLevel = 'VIEW' | 'DOWNLOAD';

export interface ConsentScope {
  id: string;
  consentId: string;
  resourceType: ConsentResourceType;
  resourceId?: string | null;
  resourceCategory?: string | null;
  accessLevel: ConsentAccessLevel;
  createdAt: string;
}

export interface Consent {
  id: string;
  patientId: string;
  requesterId: string;
  requesterRole: UserRole;
  purpose: ConsentPurpose;
  purposeDescription: string;
  status: ConsentStatus;
  declineReason?: string | null;
  revokeReason?: string | null;
  requestedAt: string;
  approvedAt?: string | null;
  declinedAt?: string | null;
  revokedAt?: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  scopes: ConsentScope[];
  requester?: {
    id: string;
    email: string;
    doctorProfile?: {
      fullName: string;
      specialization?: string | null;
      hospitalAffiliation?: string | null;
      city?: string | null;
      clinicName?: string | null;
      verificationStatus?: string | null;
    } | null;
  };
  patient?: {
    id: string;
    email: string;
    patientProfile?: {
      fullName: string;
      city?: string | null;
      bloodGroup?: string | null;
    } | null;
  };
}

export interface CreateConsentScopePayload {
  resourceType: ConsentResourceType;
  resourceId?: string;
  resourceCategory?: string;
  accessLevel?: ConsentAccessLevel;
}

export interface CreateConsentPayload {
  patientId: string;
  purpose: ConsentPurpose;
  purposeDescription: string;
  expiresAt: string;
  scopes: CreateConsentScopePayload[];
}

export type NotificationType =
  | 'CONSENT_REQUESTED'
  | 'CONSENT_APPROVED'
  | 'CONSENT_DECLINED'
  | 'CONSENT_REVOKED'
  | 'CONSENT_EXPIRING_SOON'
  | 'CONSENT_EXPIRED'
  | 'ACCESS_REQUESTED'
  | 'ACCESS_GRANTED'
  | 'DOCTOR_ASSIGNED'
  | 'DOCUMENT_UPLOADED'
  | 'CLINICAL_FEEDBACK_ADDED'
  | 'CONSULTATION_CREATED'
  | 'PRESCRIPTION_ISSUED'
  | 'INVESTIGATION_ORDERED'
  | 'FOLLOW_UP_SCHEDULED'
  | 'DOCUMENT_RESTORED'
  | 'DOCTOR_VERIFIED'
  | 'SECURITY_ALERT'
  | 'GENERAL';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'WHATSAPP' | 'SMS';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
}

export type LabVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
export type LabMemberRole = 'LAB_ADMIN' | 'LAB_TECHNICIAN' | 'LAB_PATHOLOGIST';
export type LabMemberStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type LabTestCategory =
  | 'HEMATOLOGY'
  | 'BIOCHEMISTRY'
  | 'PATHOLOGY'
  | 'MICROBIOLOGY'
  | 'IMMUNOLOGY'
  | 'ENDOCRINOLOGY'
  | 'URINALYSIS'
  | 'OTHER';
export type LabOrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'SAMPLE_PENDING'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORT_PENDING_REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';
export type LabCollectionMode = 'LAB' | 'HOME' | 'FACILITY_VISIT' | 'HOME_COLLECTION';
export type LabSampleStatus =
  | 'PENDING'
  | 'COLLECTED'
  | 'RECEIVED'
  | 'REJECTED'
  | 'PROCESSING'
  | 'COMPLETED';
export type LabReportStatus =
  | 'DRAFT'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'FINALIZED'
  | 'AMENDED'
  | 'CANCELLED';

export interface LabOrganization {
  id: string;
  name: string;
  legalName?: string | null;
  licenseNumber: string;
  accreditationDetails?: Record<string, any> | null;
  contactEmail: string;
  contactPhone: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  operatingHours?: Record<string, any> | null;
  supportedSampleTypes?: string[];
  verificationStatus: LabVerificationStatus;
  verificationNotes?: string | null;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    catalogTests?: number;
    orders?: number;
    memberships?: number;
  };
}

export interface LabMembership {
  id: string;
  labId: string;
  lab?: LabOrganization;
  userId: string;
  user?: Partial<User>;
  role: LabMemberRole;
  status: LabMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface LabTest {
  id: string;
  labId: string;
  lab?: Partial<LabOrganization>;
  testCode: string;
  name: string;
  category: LabTestCategory;
  description?: string | null;
  sampleTypes?: string[];
  turnaroundTime?: string | null;
  price: number | string;
  preparationNotes?: string | null;
  isHomeCollection: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabOrderItem {
  id: string;
  orderId: string;
  testId?: string | null;
  test?: Partial<LabTest> | null;
  testName: string;
  testCode: string;
  price: number | string;
  notes?: string | null;
  createdAt: string;
}

export interface LabSample {
  id: string;
  orderId: string;
  sampleType: string;
  sampleIdentifier: string;
  barcode?: string | null;
  status: LabSampleStatus;
  collectedAt?: string | null;
  collectedById?: string | null;
  collectedBy?: { id: string; email: string } | null;
  receivedAt?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabReport {
  id: string;
  reportNumber: string;
  orderId: string;
  order?: LabOrder;
  labId?: string;
  lab?: LabOrganization;
  documentId?: string | null;
  document?: MedicalDocument | null;
  status: LabReportStatus;
  testSummary?: string | null;
  clinicalNotes?: string | null;
  verifiedById?: string | null;
  verifiedBy?: { id: string; email: string } | null;
  verifiedAt?: string | null;
  finalizedAt?: string | null;
  isAmended: boolean;
  amendedReason?: string | null;
  previousReportId?: string | null;
  previousReport?: LabReport | null;
  amendedReports?: LabReport[];
  createdAt: string;
  updatedAt: string;
}

export interface LabOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  patientName?: string | null;
  patient?: {
    id: string;
    email: string;
    patientProfile?: {
      fullName: string;
      gender?: Gender | null;
      dateOfBirth?: string | null;
      mobile?: string | null;
      bloodGroup?: BloodGroup | null;
    } | null;
  };
  prescribedDoctorId?: string | null;
  prescribedDoctor?: {
    id: string;
    email: string;
    doctorProfile?: {
      fullName: string;
      specialization?: string | null;
    } | null;
  } | null;
  investigationRequestId?: string | null;
  labId: string;
  lab?: LabOrganization;
  status: LabOrderStatus;
  collectionMode: LabCollectionMode;
  collectionAddress?: string | null;
  scheduledDate?: string | null;
  instructions?: string | null;
  priority: string;
  notes?: string | null;
  cancelledReason?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: LabOrderItem[];
  samples?: LabSample[];
  reports?: LabReport[];
  labLocationId?: string | null;
  labLocation?: LabLocation | null;
  canonicalTestId?: string | null;
  basePrice?: number | string | null;
  homeCollectionFee?: number | string | null;
  discount?: number | string | null;
  totalPrice?: number | string | null;
  currency?: string;
  careConnection?: Partial<LabCareConnection> | null;
  labCareConnection?: Partial<LabCareConnection> | null;
  _count?: {
    samples?: number;
    reports?: number;
  };
}

// -------------------------------------------------------------
// M5.1 — Lab Discovery, Marketplace & Temporary Clinical Connections
// -------------------------------------------------------------

export interface CanonicalTest {
  id: string;
  code: string;
  name: string;
  category: LabTestCategory;
  description?: string | null;
  sampleTypes: string[];
  defaultTurnaroundTime?: string | null;
  synonyms: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    labTests?: number;
  };
}

export interface LabLocation {
  id: string;
  labId: string;
  name: string;
  branchName?: string;
  address?: string;
  addressLine1: string;
  addressLine2?: string | null;
  area?: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  operatingHours?: Record<string, any> | null;
  homeCollectionAvailable: boolean;
  homeCollectionFee?: number | string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type LabCareConnectionStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'SAMPLE_COLLECTED'
  | 'TEST_COMPLETED'
  | 'REPORT_READY'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'AUTO_REVOKED'
  | 'MANUAL_REVOKED'
  | 'CANCELLED';

export type LabCareAccessScope =
  | 'PATIENT_BASIC_PROFILE'
  | 'INVESTIGATION_REQUEST'
  | 'RELEVANT_PRESCRIPTION'
  | 'RELEVANT_MEDICATION_CONTEXT'
  | 'RELEVANT_PRIOR_REPORT'
  | 'SAMPLE_INFORMATION';

export interface LabCareConnection {
  id: string;
  patientId: string;
  doctorId?: string | null;
  labId: string;
  investigationRequestId?: string | null;
  labOrderId: string;
  status: LabCareConnectionStatus;
  purpose: string;
  scopes: LabCareAccessScope[];
  accessGrantedAt: string;
  expiresAt: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  sampleCollectedAt?: string | null;
  testCompletedAt?: string | null;
  reportFinalizedAt?: string | null;
  reportDeliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  patientContext?: {
    id: string;
    fullName: string;
    gender?: string | null;
    dateOfBirth?: string | null;
    age?: number | null;
    contactPhone?: string | null;
    collectionAddress?: string | null;
  };
  investigationContext?: {
    id: string;
    investigationName: string;
    category: string;
    priority: string;
    clinicalNotes?: string | null;
    reason?: string | null;
  } | null;
  prescribingDoctorContext?: {
    id: string;
    fullName?: string | null;
    clinicName?: string | null;
  } | null;
  lab?: LabOrganization;
  order?: Partial<LabOrder>;
}

export interface DiscoveredLabItem {
  lab: {
    id: string;
    name: string;
    legalName?: string | null;
    licenseNumber: string;
    accreditationDetails?: Record<string, any> | null;
    contactEmail: string;
    contactPhone: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    operatingHours?: Record<string, any> | null;
    supportedSampleTypes?: string[];
    hasHomeCollection: boolean;
    verificationStatus?: string;
  };
  closestLocation?: {
    id: string;
    name: string;
    addressLine1: string;
    city: string;
    pincode: string;
    phone?: string | null;
    homeCollectionAvailable: boolean;
    homeCollectionFee: number;
  } | null;
  location?: any;
  distanceKm?: number | null;
  matchingTest?: {
    id: string;
    testCode: string;
    name: string;
    category: LabTestCategory;
    turnaroundTime?: string | null;
    turnaroundHours: number;
    preparationNotes?: string | null;
    isHomeCollection: boolean;
    canonicalTest?: {
      id: string;
      code: string;
      name: string;
    } | null;
  } | null;
  tat?: string;
  isHomeCollectionAvailable?: boolean;
  sampleTypes?: string[];
  pricing: {
    basePrice?: number | null;
    testPrice?: number;
    homeCollectionFee: number;
    discount?: number;
    totalPrice?: number | null;
    currency: string;
    isAccredited?: boolean;
  };
  matchScore: number;
}

export interface DiscoverLabsResponse {
  items: DiscoveredLabItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  investigationContext?: {
    id: string;
    investigationName: string;
    category: string;
    priority: string;
    doctorName: string;
  } | null;
}

export interface InvestigationComparisonResponse {
  investigation: {
    id: string;
    investigationName: string;
    category: string;
    reason: string;
    priority: string;
    notes?: string | null;
    requestedDate: string;
    doctor?: {
      fullName?: string | null;
      clinicName?: string | null;
    } | null;
  };
  comparison: DiscoveredLabItem[];
  labs?: DiscoveredLabItem[];
  canonicalTest?: CanonicalTest | null;
}

export interface SelectLabForInvestigationPayload {
  labId: string;
  testId?: string;
  labLocationId?: string;
  collectionMode: LabCollectionMode;
  collectionAddress?: string;
  scheduledDate?: string;
  preferredDate?: string;
  notes?: string;
  ttlHours?: number;
}

export interface ShareReportWithDoctorPayload {
  doctorId: string;
  purpose?: string;
  notes?: string;
  durationDays?: number;
  expiresInDays?: number;
}



