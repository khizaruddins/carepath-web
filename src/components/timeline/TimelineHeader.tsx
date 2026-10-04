import React from 'react';
import { Search, Filter, Calendar, X, RotateCcw } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { DateRangePreset } from '@/lib/timeline-utils';

interface TimelineHeaderProps {
  total: number;
  yearSpan: string | null;
  lastActivityDate: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedDatePreset: DateRangePreset;
  onDatePresetChange: (preset: DateRangePreset) => void;
  hasActiveFilters: boolean;
  onResetFilters: () => void;
  isDoctorView?: boolean;
}

export function TimelineHeader({
  total,
  yearSpan,
  lastActivityDate,
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedDatePreset,
  onDatePresetChange,
  hasActiveFilters,
  onResetFilters,
  isDoctorView = false,
}: TimelineHeaderProps) {
  return (
    <div className="space-y-4 text-left">
      {/* Calm, Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isDoctorView ? 'Patient Health Timeline' : 'Health Timeline'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isDoctorView
              ? 'Longitudinal clinical chronology authorized under patient consent.'
              : 'Your healthcare history in one place.'}
          </p>
        </div>

        {/* Factual Factual Summary Stats (No fake analytics) */}
        {total > 0 && (
          <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-md self-start sm:self-auto">
            <span className="font-semibold text-slate-800">
              {total} {total === 1 ? 'event' : 'events'}
            </span>
            {yearSpan && (
              <>
                <span className="text-slate-300">•</span>
                <span>{yearSpan}</span>
              </>
            )}
            {lastActivityDate && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600">Latest: {lastActivityDate}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search records, tests, doctors..."
            leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="text-xs"
          />
        </div>

        {/* Event Type Filter */}
        <div className="w-full md:w-52">
          <Select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="text-xs"
            options={[
              { label: 'All Event Types', value: '' },
              { label: 'Documents & Reports', value: 'DOCUMENT' },
              { label: 'Consultations', value: 'CONSULTATION' },
              { label: 'Prescriptions', value: 'PRESCRIPTION' },
              { label: 'Investigations', value: 'INVESTIGATION' },
              { label: 'Referrals', value: 'REFERRAL' },
              { label: 'Follow-ups', value: 'FOLLOW_UP' },
            ]}
          />
        </div>

        {/* Date Range Preset Filter */}
        <div className="w-full md:w-44">
          <Select
            value={selectedDatePreset}
            onChange={(e) => onDatePresetChange(e.target.value as DateRangePreset)}
            className="text-xs"
            options={[
              { label: 'All Time', value: 'all' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 3 Months', value: '3m' },
              { label: 'Last 6 Months', value: '6m' },
              { label: 'Last Year', value: '1y' },
            ]}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onResetFilters}
            className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
            leftIcon={<RotateCcw className="h-3 w-3" />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
