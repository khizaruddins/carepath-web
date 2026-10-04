import { api } from './client';
import { AuditLog } from './types';

export const auditApi = {
  getMyAuditLogs: (params: { limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const qs = query.toString();
    return api.get<AuditLog[]>(`/audit/me${qs ? `?${qs}` : ''}`);
  },
};
