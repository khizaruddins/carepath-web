'use client';

import React, { useState, useMemo } from 'react';
import { useTimeline } from '@/lib/hooks/useTimeline';
import {
  TimelineEventType,
  TimelineSourceType,
  TimelineEventItem,
} from '@/lib/api/types';
import {
  DateRangePreset,
  groupTimelineEventsByMonth,
  getTimelineSummaryStats,
} from '@/lib/timeline-utils';
import { TimelineHeader } from './TimelineHeader';
import { TimelineGroup } from './TimelineGroup';
import { TimelineSkeleton } from './TimelineSkeleton';
import { TimelineEmptyState } from './TimelineEmptyState';
import { TimelineSourceModal } from './TimelineSourceModal';
import { DoctorTimelineNotice } from './DoctorTimelineNotice';
import { ErrorMessage } from '../ui/ErrorMessage';
import { Button } from '../ui/Button';
import { ChevronDown, Loader2 } from 'lucide-react';
import { DocumentUploadModal } from '../documents/DocumentUploadModal';

interface TimelineContainerProps {
  patientId?: string;
  isDoctorView?: boolean;
  patientName?: string;
  consentExpiresAt?: string | null;
}

export function TimelineContainer({
  patientId,
  isDoctorView = false,
  patientName,
  consentExpiresAt,
}: TimelineContainerProps) {
  // Filter states
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');

  // Selected event for source detail modal
  const [selectedEvent, setSelectedEvent] = useState<TimelineEventItem | null>(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const filters = useMemo(() => {
    return {
      search: search.trim() || undefined,
      eventType: selectedType ? (selectedType as TimelineEventType) : undefined,
      sourceType: selectedType ? (selectedType as TimelineSourceType) : undefined,
      datePreset,
      limit: 30,
    };
  }, [search, selectedType, datePreset]);

  // Query timeline
  const {
    events,
    total,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useTimeline({
    patientId,
    isDoctorView,
    filters,
  });

  const hasActiveFilters = !!search || !!selectedType || datePreset !== 'all';

  const handleResetFilters = () => {
    setSearch('');
    setSelectedType('');
    setDatePreset('all');
  };

  // Group events by month & year
  const groupedEvents = useMemo(() => {
    return groupTimelineEventsByMonth(events);
  }, [events]);

  // Factual summary stats
  const summary = useMemo(() => {
    return getTimelineSummaryStats(events, total);
  }, [events, total]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Doctor Authorization Banner */}
      {isDoctorView && (
        <DoctorTimelineNotice
          patientName={patientName}
          expiresAt={consentExpiresAt}
        />
      )}

      {/* Header with Search, Filters, and Summary Stats */}
      <TimelineHeader
        total={summary.total}
        yearSpan={summary.yearSpan}
        lastActivityDate={summary.lastActivityDate}
        search={search}
        onSearchChange={setSearch}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedDatePreset={datePreset}
        onDatePresetChange={setDatePreset}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        isDoctorView={isDoctorView}
      />

      {/* Loading state */}
      {isLoading && <TimelineSkeleton />}

      {/* Error state */}
      {error && !isLoading && (
        <ErrorMessage
          title="We couldn't load your timeline"
          message="Your health records are safe. Please check your network connection and try again."
          onRetry={() => refetch()}
        />
      )}

      {/* Empty state */}
      {!isLoading && !error && events.length === 0 && (
        <TimelineEmptyState
          hasActiveFilters={hasActiveFilters}
          isDoctorView={isDoctorView}
          onResetFilters={handleResetFilters}
          onUploadClick={() => setUploadModalOpen(true)}
        />
      )}

      {/* Chronological Longitudinal Feed */}
      {!isLoading && !error && events.length > 0 && (
        <div className="space-y-10 pt-2">
          {groupedEvents.map((group) => (
            <TimelineGroup
              key={group.monthKey}
              group={group}
              onSelectEvent={(evt) => setSelectedEvent(evt)}
            />
          ))}

          {/* Pagination: Load More Older Records */}
          <div className="pt-4 pb-8 flex flex-col items-center justify-center text-center">
            {hasNextPage ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="text-xs px-4 border-slate-300 text-slate-700 hover:bg-slate-50"
                rightIcon={
                  isFetchingNextPage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  )
                }
              >
                {isFetchingNextPage ? 'Loading older records...' : 'Load older records'}
              </Button>
            ) : (
              <p className="text-xs text-slate-400 font-medium">
                Showing all {events.length} chronological records
              </p>
            )}
          </div>
        </div>
      )}

      {/* Original Source Record Viewer Modal */}
      <TimelineSourceModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Upload Modal (if triggered via empty state CTA) */}
      {!isDoctorView && (
        <DocumentUploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
