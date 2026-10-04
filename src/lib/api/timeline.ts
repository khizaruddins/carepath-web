import { api } from './client';
import {
  TimelineEventType,
  TimelineSourceType,
  TimelineResponse,
  TimelineEventDetails,
} from './types';

export interface QueryTimelineParams {
  limit?: number;
  cursor?: string;
  from?: string;
  to?: string;
  eventType?: TimelineEventType;
  sourceType?: TimelineSourceType;
  providerId?: string;
  search?: string;
  sortOrder?: 'asc' | 'desc';
  offset?: number; // legacy backwards-compat
}

export const timelineApi = {
  /**
   * Patient retrieves their own longitudinal healthcare timeline
   */
  getMyTimeline: (params: QueryTimelineParams = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.eventType) query.set('eventType', params.eventType);
    if (params.sourceType) query.set('sourceType', params.sourceType);
    if (params.providerId) query.set('providerId', params.providerId);
    if (params.search) query.set('search', params.search);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params.offset !== undefined) query.set('offset', String(params.offset));

    const qs = query.toString();
    return api.get<TimelineResponse>(`/timeline${qs ? `?${qs}` : ''}`);
  },

  /**
   * Backward-compatible alias for getMyTimeline
   */
  getTimeline: (params: QueryTimelineParams = {}) => {
    return timelineApi.getMyTimeline(params);
  },

  /**
   * Clinician retrieves patient timeline with active consent scope filtering
   */
  getPatientTimeline: (patientId: string, params: QueryTimelineParams = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', String(params.limit));
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.from) query.set('from', params.from);
    if (params.to) query.set('to', params.to);
    if (params.eventType) query.set('eventType', params.eventType);
    if (params.sourceType) query.set('sourceType', params.sourceType);
    if (params.providerId) query.set('providerId', params.providerId);
    if (params.search) query.set('search', params.search);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);

    const qs = query.toString();
    return api.get<TimelineResponse>(`/patients/${patientId}/timeline${qs ? `?${qs}` : ''}`);
  },

  /**
   * Retrieve specific timeline event with resolved source details
   */
  getTimelineEventDetails: (id: string) => {
    return api.get<TimelineEventDetails>(`/timeline/${id}`);
  },

  /**
   * Admin/Internal trigger to reconcile and backfill timeline projections
   */
  backfillTimeline: (patientId?: string) => {
    const qs = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return api.post<{ message: string; projectedCount: number }>(`/timeline/backfill${qs}`);
  },
};
