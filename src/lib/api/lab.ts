import { api } from './client';
import {
  LabOrganization,
  LabMembership,
  LabTest,
  LabOrder,
  LabSample,
  LabReport,
  LabMemberRole,
  LabMemberStatus,
  LabTestCategory,
  LabOrderStatus,
  LabSampleStatus,
  LabVerificationStatus,
  LabCollectionMode,
  CanonicalTest,
  LabLocation,
  LabCareConnection,
  DiscoveredLabItem,
  DiscoverLabsResponse,
  InvestigationComparisonResponse,
  SelectLabForInvestigationPayload,
  ShareReportWithDoctorPayload,
} from './types';
import { InvestigationRequest } from './doctor';

export interface DiscoverLabsParams {
  q?: string;
  city?: string;
  area?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  investigationRequestId?: string;
  canonicalTestId?: string;
  category?: LabTestCategory;
  collectionMode?: LabCollectionMode;
  sort?: 'NEARBY' | 'CHEAPEST' | 'FASTEST' | 'BEST_MATCH';
  page?: number;
  limit?: number;
}


export interface RegisterLabPayload {
  name: string;
  legalName?: string;
  licenseNumber: string;
  accreditationDetails?: Record<string, any>;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  operatingHours?: Record<string, any>;
  supportedSampleTypes?: string[];
}

export interface CreateLabTestPayload {
  testCode: string;
  name: string;
  category: LabTestCategory;
  description?: string;
  sampleTypes?: string[];
  turnaroundTime?: string;
  price: number;
  preparationNotes?: string;
  isHomeCollection?: boolean;
}

export interface CreateLabOrderPayload {
  labId: string;
  patientId?: string;
  prescribedDoctorId?: string;
  investigationRequestId?: string;
  tests: string[];
  collectionMode?: LabCollectionMode;
  collectionAddress?: string;
  scheduledDate?: string;
  instructions?: string;
  priority?: string;
  notes?: string;
}

export const labApi = {
  // -------------------------------------------------------------
  // 1. Lab Organization & Profile
  // -------------------------------------------------------------
  async registerLab(data: RegisterLabPayload): Promise<LabOrganization> {
    return api.post<LabOrganization>('/labs', data);
  },

  async getMyLab(): Promise<{
    membershipId: string;
    role: LabMemberRole;
    status: LabMemberStatus;
    lab: LabOrganization;
  }> {
    return api.get<{
      membershipId: string;
      role: LabMemberRole;
      status: LabMemberStatus;
      lab: LabOrganization;
    }>('/labs/me');
  },

  async listVerifiedLabs(params?: { city?: string; search?: string }): Promise<LabOrganization[]> {
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<LabOrganization[]>(qs ? `/labs?${qs}` : '/labs');
  },

  async getLabProfile(id: string): Promise<LabOrganization> {
    return api.get<LabOrganization>(`/labs/${id}`);
  },

  async updateLabProfile(id: string, data: Partial<RegisterLabPayload>): Promise<LabOrganization> {
    return api.patch<LabOrganization>(`/labs/${id}`, data);
  },

  async addLabMember(
    id: string,
    userId: string,
    role: LabMemberRole = 'LAB_TECHNICIAN',
  ): Promise<LabMembership> {
    return api.post<LabMembership>(`/labs/${id}/members`, { userId, role });
  },

  async listLabMembers(id: string): Promise<LabMembership[]> {
    return api.get<LabMembership[]>(`/labs/${id}/members`);
  },

  // -------------------------------------------------------------
  // 2. Test Catalog
  // -------------------------------------------------------------
  async createCatalogTest(labId: string, data: CreateLabTestPayload): Promise<LabTest> {
    return api.post<LabTest>(`/labs/${labId}/tests`, data);
  },

  async updateCatalogTest(
    labId: string,
    testId: string,
    data: Partial<CreateLabTestPayload> & { isActive?: boolean },
  ): Promise<LabTest> {
    return api.patch<LabTest>(`/labs/${labId}/tests/${testId}`, data);
  },

  async listLabTests(labId: string, category?: LabTestCategory): Promise<LabTest[]> {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    const qs = query.toString();
    return api.get<LabTest[]>(qs ? `/labs/${labId}/tests?${qs}` : `/labs/${labId}/tests`);
  },

  // -------------------------------------------------------------
  // 3. Orders Lifecycle
  // -------------------------------------------------------------
  async createOrder(data: CreateLabOrderPayload): Promise<LabOrder> {
    return api.post<LabOrder>('/lab-orders', data);
  },

  async listOrders(params?: {
    status?: LabOrderStatus;
    labId?: string;
    patientId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ total: number; page: number; limit: number; orders: LabOrder[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.labId) query.append('labId', params.labId);
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return api.get<{ total: number; page: number; limit: number; orders: LabOrder[] }>(
      qs ? `/lab-orders?${qs}` : '/lab-orders',
    );
  },

  async getOrder(id: string): Promise<LabOrder> {
    return api.get<LabOrder>(`/lab-orders/${id}`);
  },

  async updateOrderStatus(
    id: string,
    data: { status: LabOrderStatus; reason?: string; notes?: string },
  ): Promise<LabOrder> {
    return api.patch<LabOrder>(`/lab-orders/${id}/status`, data);
  },

  // -------------------------------------------------------------
  // 4. Samples Tracking
  // -------------------------------------------------------------
  async createSample(
    orderId: string,
    data: {
      sampleType: string;
      sampleIdentifier: string;
      barcode?: string;
      notes?: string;
    },
  ): Promise<LabSample> {
    return api.post<LabSample>(`/lab-orders/${orderId}/samples`, data);
  },

  async updateSampleStatus(
    sampleId: string,
    data: {
      status: LabSampleStatus;
      rejectionReason?: string;
      notes?: string;
    },
  ): Promise<LabSample> {
    return api.patch<LabSample>(`/lab-samples/${sampleId}`, data);
  },

  // -------------------------------------------------------------
  // 5. Reports Lifecycle
  // -------------------------------------------------------------
  async createDraftReport(
    orderId: string,
    data: { testSummary?: string; clinicalNotes?: string },
  ): Promise<LabReport> {
    return api.post<LabReport>(`/lab-orders/${orderId}/reports`, data);
  },

  async updateReport(
    id: string,
    data: { testSummary?: string; clinicalNotes?: string },
  ): Promise<LabReport> {
    return api.patch<LabReport>(`/lab-reports/${id}`, data);
  },

  async finalizeReport(
    id: string,
    data: { testSummary: string; clinicalNotes?: string; documentId?: string },
  ): Promise<LabReport> {
    return api.post<LabReport>(`/lab-reports/${id}/finalize`, data);
  },

  async amendReport(
    id: string,
    data: {
      amendedReason: string;
      testSummary: string;
      clinicalNotes?: string;
      documentId?: string;
    },
  ): Promise<LabReport> {
    return api.post<LabReport>(`/lab-reports/${id}/amend`, data);
  },

  async getReport(id: string): Promise<LabReport> {
    return api.get<LabReport>(`/lab-reports/${id}`);
  },

  // -------------------------------------------------------------
  // 6. Admin Verifications
  // -------------------------------------------------------------
  async listVerifications(status?: LabVerificationStatus): Promise<LabOrganization[]> {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    const qs = query.toString();
    return api.get<LabOrganization[]>(
      qs ? `/admin/labs/verifications?${qs}` : '/admin/labs/verifications',
    );
  },

  async reviewVerification(
    id: string,
    data: { status: LabVerificationStatus; notes?: string },
  ): Promise<LabOrganization> {
    return api.patch<LabOrganization>(`/admin/labs/${id}/verification`, data);
  },

  // -------------------------------------------------------------
  // 7. M5.1 Lab Discovery & Investigation Marketplace
  // -------------------------------------------------------------
  async discoverLabs(params?: DiscoverLabsParams): Promise<DiscoverLabsResponse> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.city) query.append('city', params.city);
    if (params?.area) query.append('area', params.area);
    if (params?.pincode) query.append('pincode', params.pincode);
    if (params?.latitude !== undefined) query.append('latitude', String(params.latitude));
    if (params?.longitude !== undefined) query.append('longitude', String(params.longitude));
    if (params?.radiusKm !== undefined) query.append('radiusKm', String(params.radiusKm));
    if (params?.investigationRequestId) query.append('investigationRequestId', params.investigationRequestId);
    if (params?.canonicalTestId) query.append('canonicalTestId', params.canonicalTestId);
    if (params?.category) query.append('category', params.category);
    if (params?.collectionMode) query.append('collectionMode', params.collectionMode);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    const qs = query.toString();
    return api.get<DiscoverLabsResponse>(qs ? `/labs/discover?${qs}` : '/labs/discover');
  },

  async listCanonicalTests(params?: { category?: LabTestCategory; search?: string }): Promise<CanonicalTest[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const qs = query.toString();
    return api.get<CanonicalTest[]>(qs ? `/labs/canonical-tests?${qs}` : '/labs/canonical-tests');
  },

  async getCanonicalTest(id: string): Promise<CanonicalTest> {
    return api.get<CanonicalTest>(`/labs/canonical-tests/${id}`);
  },

  async createCanonicalTest(data: Partial<CanonicalTest>): Promise<CanonicalTest> {
    return api.post<CanonicalTest>('/admin/canonical-tests', data);
  },

  // -------------------------------------------------------------
  // 8. M5.1 Multi-Branch Laboratory Locations
  // -------------------------------------------------------------
  async createLabLocation(labId: string, data: Partial<LabLocation>): Promise<LabLocation> {
    return api.post<LabLocation>(`/labs/${labId}/locations`, data);
  },

  async listLabLocations(labId: string): Promise<LabLocation[]> {
    return api.get<LabLocation[]>(`/labs/${labId}/locations`);
  },

  // -------------------------------------------------------------
  // 9. M5.1 Investigation Requests & Lab Selection
  // -------------------------------------------------------------
  async getPatientInvestigations(): Promise<InvestigationRequest[]> {
    return api.get<InvestigationRequest[]>('/investigations');
  },

  async getInvestigationById(id: string): Promise<InvestigationRequest> {
    return api.get<InvestigationRequest>(`/investigations/${id}`);
  },

  async compareLabsForInvestigation(
    investigationId: string,
    params?: {
      latitude?: number;
      longitude?: number;
      collectionMode?: LabCollectionMode;
      sort?: string;
    },
  ): Promise<InvestigationComparisonResponse> {
    const query = new URLSearchParams();
    if (params?.latitude !== undefined) query.append('latitude', String(params.latitude));
    if (params?.longitude !== undefined) query.append('longitude', String(params.longitude));
    if (params?.collectionMode) query.append('collectionMode', params.collectionMode);
    if (params?.sort) query.append('sort', params.sort);
    const qs = query.toString();
    return api.get<InvestigationComparisonResponse>(
      qs ? `/investigations/${investigationId}/labs/comparison?${qs}` : `/investigations/${investigationId}/labs/comparison`,
    );
  },

  async selectLabForInvestigation(
    investigationId: string,
    payload: SelectLabForInvestigationPayload,
  ): Promise<{
    message: string;
    order: LabOrder;
    connection: LabCareConnection;
    pricing: {
      basePrice: number;
      homeCollectionFee: number;
      totalPrice: number;
      currency: string;
    };
  }> {
    return api.post(`/investigations/${investigationId}/select-lab`, payload);
  },

  // -------------------------------------------------------------
  // 10. M5.1 Temporary Clinical Connections
  // -------------------------------------------------------------
  async getLabCareConnection(id: string): Promise<LabCareConnection> {
    return api.get<LabCareConnection>(`/lab-care-connections/${id}`);
  },

  async getLabCareConnectionByOrder(orderId: string): Promise<LabCareConnection> {
    return api.get<LabCareConnection>(`/lab-care-connections/orders/${orderId}`);
  },

  async revokeLabCareConnection(
    id: string,
    reason?: string,
  ): Promise<{ message: string; connection: LabCareConnection }> {
    return api.post(`/lab-care-connections/${id}/revoke`, { reason });
  },

  // -------------------------------------------------------------
  // 11. M5.1 Patient-Controlled Report Sharing
  // -------------------------------------------------------------
  async shareReportWithDoctor(
    reportId: string,
    payload: ShareReportWithDoctorPayload,
  ): Promise<{ message: string; consent: any }> {
    return api.post(`/lab-reports/${reportId}/share-with-doctor`, payload);
  },
};

