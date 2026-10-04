import { api } from './client';
import { MedicalDocument, DocumentCategory, DocumentProcessingStatus } from './types';

export interface GetDocumentsParams {
  category?: DocumentCategory;
  status?: DocumentProcessingStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DocumentsListResponse {
  total: number;
  limit: number;
  offset: number;
  documents: MedicalDocument[];
}

export interface UploadDocumentPayload {
  file: File;
  category: DocumentCategory;
  reportTitle?: string;
  providerName?: string;
  facility?: string;
  documentDate?: string;
  patientNotes?: string;
}

export interface UpdateDocumentPayload {
  category?: DocumentCategory;
  reportTitle?: string;
  providerName?: string;
  facility?: string;
  documentDate?: string;
  patientNotes?: string;
  isPatientConfirmed?: boolean;
  extractedData?: Record<string, any>;
}

export const documentsApi = {
  getDocuments: (params: GetDocumentsParams = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return api.get<DocumentsListResponse>(`/documents${qs ? `?${qs}` : ''}`);
  },

  getDocumentById: (id: string) =>
    api.get<MedicalDocument>(`/documents/${id}`),

  uploadDocument: (payload: UploadDocumentPayload) => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('category', payload.category);
    if (payload.reportTitle) formData.append('reportTitle', payload.reportTitle);
    if (payload.providerName) formData.append('providerName', payload.providerName);
    if (payload.facility) formData.append('facility', payload.facility);
    if (payload.documentDate) formData.append('documentDate', payload.documentDate);
    if (payload.patientNotes) formData.append('patientNotes', payload.patientNotes);

    return api.upload<{ message: string; document: MedicalDocument }>('/documents', formData);
  },

  updateDocument: (id: string, payload: UpdateDocumentPayload) =>
    api.patch<{ message: string; metadata: any }>(`/documents/${id}`, payload),

  deleteDocument: (id: string) =>
    api.delete<{ message: string }>(`/documents/${id}`),

  downloadDocument: (id: string) =>
    api.get<{
      downloadUrl: string;
      fileName: string;
      mimeType: string;
      fileSizeBytes: number;
      expiresInSeconds: number;
    }>(`/documents/${id}/download`),

  getArchivedDocuments: () =>
    api.get<MedicalDocument[]>('/documents/archived'),

  requestDocumentRestore: (id: string, reason?: string) =>
    api.post<{ message: string; request: any; document: MedicalDocument }>(
      `/documents/${id}/restore-request`,
      { reason },
    ),

  cancelDocumentRestore: (id: string) =>
    api.post<{ message: string; document: MedicalDocument }>(
      `/documents/${id}/restore-cancel`,
      {},
    ),

  getAdminRestoreRequests: (status?: string) =>
    api.get<import('./types').DocumentRestoreRequestItem[]>(
      `/documents/admin/restore-requests${status && status !== 'ALL' ? `?status=${status}` : ''}`,
    ),

  reviewDocumentRestore: (
    requestId: string,
    status: 'APPROVED' | 'REJECTED',
    adminNotes?: string,
    rejectionReason?: string,
  ) =>
    api.patch<{
      message: string;
      request: import('./types').DocumentRestoreRequestItem;
      document: MedicalDocument;
    }>(`/documents/admin/restore-requests/${requestId}/review`, {
      status,
      adminNotes,
      rejectionReason,
    }),

  restoreDocument: (id: string) =>
    api.patch<{ message: string; document: MedicalDocument }>(`/documents/admin/${id}/restore`),
};
