import React from 'react';
import {
  TimelineEventItem,
} from '@/lib/api/types';
import {
  formatTimelineEventDate,
  formatSpineDayLabel,
  getTimelineEventMeta,
} from '@/lib/timeline-utils';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ExternalLink, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TimelineCardProps {
  event: TimelineEventItem;
  onSelectEvent: (event: TimelineEventItem) => void;
}

export function TimelineCard({ event, onSelectEvent }: TimelineCardProps) {
  const meta = getTimelineEventMeta(event.eventType, event.source?.type);
  const Icon = meta.icon;

  const formattedDate = formatTimelineEventDate(
    event.eventDate,
    event.datePrecision,
    true,
  );
  const spineDayLabel = formatSpineDayLabel(event.eventDate, event.datePrecision);

  // Status badge if present in metadata
  const status = event.metadata?.status as string | undefined;

  return (
    <div className="relative group text-left">
      {/* Desktop Left Date Column (fixed width, right-aligned) */}
      <div className="hidden sm:block absolute -left-28 top-3.5 w-20 text-right">
        <span className="text-xs font-semibold text-slate-700 tracking-tight block">
          {spineDayLabel}
        </span>
      </div>

      {/* Desktop Spine Dot Indicator */}
      <div
        className={`hidden sm:block absolute -left-4 top-4.5 h-2.5 w-2.5 rounded-full ring-4 ${meta.dotClass} transition-transform group-hover:scale-125`}
        aria-hidden="true"
      />

      {/* Main Event Card */}
      <div className="bg-white rounded-lg border border-slate-200/90 hover:border-slate-300 p-4 shadow-2xs hover:shadow-xs transition-all">
        {/* Mobile Header (Date + Badge) */}
        <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold text-slate-800">
            {spineDayLabel}
          </span>
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {meta.label}
          </span>
        </div>

        {/* Desktop Card Header */}
        <div className="hidden sm:flex items-center justify-between gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
          >
            <Icon className="h-3 w-3 shrink-0" />
            {meta.label}
          </span>

          <span className="text-[11px] text-slate-400 font-medium">
            {formattedDate}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-bold text-slate-900 leading-snug">
          {event.title}
        </h3>

        {/* Provider or Facility */}
        {(event.providerName || event.metadata?.facility) && (
          <p className="text-xs text-slate-600 font-medium mt-1">
            {event.providerName}
            {event.providerName && event.metadata?.facility ? ' • ' : ''}
            {event.metadata?.facility}
          </p>
        )}

        {/* Short Summary (Not full private notes) */}
        {event.summary && (
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
            {event.summary}
          </p>
        )}

        {/* Footer: Status indicator + Source Action Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Status semantic indicator */}
          <div>
            {status ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 capitalize">
                {status.toLowerCase() === 'upcoming' && (
                  <Clock className="h-3 w-3 text-amber-500" />
                )}
                {status.toLowerCase() === 'completed' && (
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                )}
                {status.toLowerCase() === 'pending' && (
                  <AlertCircle className="h-3 w-3 text-sky-500" />
                )}
                <span>Status: {status.toLowerCase()}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 capitalize">
                {event.source?.type?.toLowerCase() || 'record'}
              </span>
            )}
          </div>

          {/* Action button with explicit, accessible label */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectEvent(event)}
            aria-label={`${meta.actionLabel}: ${event.title}`}
            className="text-xs h-7 px-2.5 text-teal-800 hover:text-teal-900 hover:bg-teal-50/60 border-slate-200"
            rightIcon={<ExternalLink className="h-3 w-3 text-teal-700" />}
          >
            {meta.actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
