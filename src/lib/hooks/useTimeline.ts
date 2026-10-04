'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { timelineApi } from '../api/timeline';
import {
  TimelineEventType,
  TimelineSourceType,
  TimelineEventItem,
} from '../api/types';
import { useAuth } from '../auth-context';
import { DateRangePreset, getDateRangeFromPreset } from '../timeline-utils';

export interface TimelineFiltersState {
  eventType?: TimelineEventType | '';
  sourceType?: TimelineSourceType | '';
  search?: string;
  datePreset?: DateRangePreset;
  from?: string;
  to?: string;
  providerId?: string;
  limit?: number;
}

export interface UseTimelineOptions {
  patientId?: string;
  isDoctorView?: boolean;
  filters: TimelineFiltersState;
}

export function useTimeline({
  patientId,
  isDoctorView = false,
  filters,
}: UseTimelineOptions) {
  const { user } = useAuth();
  const effectivePatientId = isDoctorView ? patientId : user?.id;

  // Resolve dates from presets if custom dates not explicitly provided
  const resolvedDateRange = filters.datePreset && filters.datePreset !== 'all'
    ? getDateRangeFromPreset(filters.datePreset)
    : { from: filters.from, to: filters.to };

  const queryKey = [
    'timeline',
    {
      actorRole: user?.role,
      actorId: user?.id,
      targetPatientId: effectivePatientId,
      isDoctorView,
      eventType: filters.eventType || undefined,
      sourceType: filters.sourceType || undefined,
      search: filters.search?.trim() || undefined,
      from: resolvedDateRange.from || undefined,
      to: resolvedDateRange.to || undefined,
      providerId: filters.providerId || undefined,
      limit: filters.limit || 50,
    },
  ];

  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const params = {
        limit: filters.limit || 50,
        cursor: pageParam,
        from: resolvedDateRange.from,
        to: resolvedDateRange.to,
        eventType: (filters.eventType as TimelineEventType) || undefined,
        sourceType: (filters.sourceType as TimelineSourceType) || undefined,
        providerId: filters.providerId,
        search: filters.search?.trim() || undefined,
        sortOrder: 'desc' as const,
      };

      if (isDoctorView && patientId) {
        return timelineApi.getPatientTimeline(patientId, params);
      }
      return timelineApi.getMyTimeline(params);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined;
    },
    enabled: !!user && (!isDoctorView || !!patientId),
    staleTime: 60 * 1000, // 1 minute
  });

  // Flatten all pages of events
  const events: TimelineEventItem[] =
    query.data?.pages.flatMap((page) => page.items || (page as any).events || []) || [];

  const total = query.data?.pages[0]?.total ?? events.length;

  return {
    ...query,
    events,
    total,
  };
}

export function useTimelineEventDetails(eventId: string | null) {
  return useQuery({
    queryKey: ['timeline-event-details', eventId],
    queryFn: () => (eventId ? timelineApi.getTimelineEventDetails(eventId) : null),
    enabled: !!eventId,
    staleTime: 2 * 60 * 1000,
  });
}
