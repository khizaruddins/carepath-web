import React from 'react';
import { MonthGroup } from '@/lib/timeline-utils';
import { TimelineEventItem } from '@/lib/api/types';
import { TimelineCard } from './TimelineCard';

interface TimelineGroupProps {
  group: MonthGroup;
  onSelectEvent: (event: TimelineEventItem) => void;
}

export function TimelineGroup({ group, onSelectEvent }: TimelineGroupProps) {
  return (
    <section className="space-y-4 text-left" aria-label={group.monthLabel}>
      {/* Month Group Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded">
          {group.monthLabel}
        </h2>
        <span className="text-[11px] text-slate-400 font-medium">
          {group.events.length} {group.events.length === 1 ? 'record' : 'records'}
        </span>
        <div className="h-px bg-slate-200 flex-1" />
      </div>

      {/* Spine with Cards */}
      <div className="space-y-4 sm:pl-28 relative before:hidden sm:before:block before:absolute before:left-24 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200/80">
        {group.events.map((event) => (
          <TimelineCard
            key={event.id}
            event={event}
            onSelectEvent={onSelectEvent}
          />
        ))}
      </div>
    </section>
  );
}
