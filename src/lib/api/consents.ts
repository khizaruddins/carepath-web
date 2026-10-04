import { api } from './client';
import {
  Consent,
  ConsentStatus,
  CreateConsentPayload,
  MedicalDocument,
} from './types';

export interface ConsentsListResponse {
  total: number;
  limit: number;
  offset: number;
  consents: Consent[];
}

export const consentsApi = {
  /**
   * List consents for the current authenticated user with role-based filtering and pagination
   */
  async getConsents(params?: {
    status?: ConsentStatus;
    limit?: number;
    offset?: number;
    patientId?: string;
    requesterId?: string;
  }): Promise<ConsentsListResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.requesterId) query.append('requesterId', params.requesterId);

    const qs = query.toString();
    const url = qs ? `/consents?${qs}` : '/consents';
    return api.get<ConsentsListResponse>(url);
  },

  /**
   * List pending consent requests awaiting patient review
   */
  async getPendingConsents(limit = 20, offset = 0): Promise<ConsentsListResponse> {
    return api.get<ConsentsListResponse>(
      `/consents/pending?limit=${limit}&offset=${offset}`,
    );
  },

  /**
   * List active approved consents with valid expiration
   */
  async getActiveConsents(limit = 20, offset = 0): Promise<ConsentsListResponse> {
    return api.get<ConsentsListResponse>(
      `/consents/active?limit=${limit}&offset=${offset}`,
    );
  },

  /**
   * List historical consents (revoked, expired, declined)
   */
  async getConsentHistory(limit = 20, offset = 0): Promise<ConsentsListResponse> {
    return api.get<ConsentsListResponse>(
      `/consents/history?limit=${limit}&offset=${offset}`,
    );
  },

  /**
   * Doctor: list consent requests created by this clinician
   */
  async getDoctorConsentRequests(params?: {
    status?: ConsentStatus;
    limit?: number;
    offset?: number;
  }): Promise<ConsentsListResponse> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.offset) query.append('offset', String(params.offset));

    const qs = query.toString();
    const url = qs ? `/consents/requests?${qs}` : '/consents/requests';
    return api.get<ConsentsListResponse>(url);
  },

  /**
   * Get single consent details with scopes and participant metadata
   */
  async getConsentById(id: string): Promise<Consent> {
    return api.get<Consent>(`/consents/${id}`);
  },

  /**
   * Resolves the concrete medical documents encompassed by consent scope
   */
  async getConsentResources(id: string): Promise<MedicalDocument[]> {
    return api.get<MedicalDocument[]>(`/consents/${id}/resources`);
  },

  /**
   * Doctor requests scoped consent to access patient medical records
   */
  async requestConsent(
    payload: CreateConsentPayload,
  ): Promise<{ message: string; consent: Consent }> {
    return api.post<{ message: string; consent: Consent }>(
      '/consents',
      payload,
    );
  },

  /**
   * Patient reviews and approves a pending consent request
   */
  async approveConsent(
    id: string,
  ): Promise<{ message: string; consent: Consent }> {
    return api.post<{ message: string; consent: Consent }>(
      `/consents/${id}/approve`,
    );
  },

  /**
   * Patient declines pending consent request with optional feedback
   */
  async declineConsent(
    id: string,
    reason?: string,
  ): Promise<{ message: string; consent: Consent }> {
    return api.post<{ message: string; consent: Consent }>(
      `/consents/${id}/decline`,
      { reason },
    );
  },

  /**
   * Patient revokes active approved consent immediately
   */
  async revokeConsent(
    id: string,
    reason?: string,
  ): Promise<{ message: string; consent: Consent }> {
    return api.post<{ message: string; consent: Consent }>(
      `/consents/${id}/revoke`,
      { reason },
    );
  },

  /**
   * Doctor cancels their own pending consent request
   */
  async cancelConsent(
    id: string,
  ): Promise<{ message: string; consent: Consent }> {
    return api.post<{ message: string; consent: Consent }>(
      `/consents/${id}/cancel`,
    );
  },
};
