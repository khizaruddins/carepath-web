import React from 'react';
import {
  FileText,
  Stethoscope,
  Pill,
  Microscope,
  Send,
  CalendarCheck,
  Clock,
  Activity,
  HeartPulse,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import {
  TimelineEventType,
  TimelineSourceType,
  TimelineDatePrecision,
  TimelineEventItem,
} from './api/types';

export interface TimelineEventMeta {
  label: string;
  actionLabel: string;
  icon: LucideIcon;
  badgeClass: string;
  dotClass: string;
}

/**
 * Format date strictly according to date precision rules (M4 Rule 6)
 * - YEAR: "2024"
 * - MONTH: "Sep 2024" (never "01 Sep 2024")
 * - DAY / EXACT: "03 Oct 2026" or "03 Oct"
 */
export function formatTimelineEventDate(
  dateString: string | Date,
  precision: TimelineDatePrecision = 'DAY',
  includeYear = true,
): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return String(dateString);

    if (precision === 'YEAR') {
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'UTC' }).format(d);
    }

    if (precision === 'MONTH') {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(d);
    }

    // DAY or EXACT
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: includeYear ? 'numeric' : undefined,
      timeZone: 'UTC',
    }).format(d);
  } catch {
    return String(dateString);
  }
}

/**
 * Short day label for the timeline spine (e.g., "03 Oct")
 */
export function formatSpineDayLabel(dateString: string | Date, precision: TimelineDatePrecision = 'DAY'): string {
  if (!dateString) return '—';
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(d.getTime())) return '—';

    if (precision === 'YEAR') {
      return new Intl.DateTimeFormat('en-US', { year: 'numeric', timeZone: 'UTC' }).format(d);
    }
    if (precision === 'MONTH') {
      return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(d);
    }
    return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(d);
  } catch {
    return '—';
  }
}

/**
 * Returns calm, professional metadata and semantic styling for each event type
 */
export function getTimelineEventMeta(
  eventType: TimelineEventType,
  sourceType?: TimelineSourceType,
): TimelineEventMeta {
  const normType = (sourceType || eventType).toUpperCase();

  switch (normType) {
    case 'CONSULTATION':
    case 'CONSULTATION_ADDED':
      return {
        label: 'Consultation',
        actionLabel: 'View consultation',
        icon: Stethoscope,
        badgeClass: 'bg-teal-50 text-teal-800 border-teal-200/80',
        dotClass: 'bg-teal-700 ring-teal-100',
      };

    case 'PRESCRIPTION':
    case 'PRESCRIPTION_ADDED':
      return {
        label: 'Prescription',
        actionLabel: 'View prescription',
        icon: Pill,
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
        dotClass: 'bg-indigo-600 ring-indigo-100',
      };

    case 'INVESTIGATION':
    case 'INVESTIGATION_REQUESTED':
      return {
        label: 'Investigation',
        actionLabel: 'View investigation',
        icon: Microscope,
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/80',
        dotClass: 'bg-amber-600 ring-amber-100',
      };

    case 'REFERRAL':
    case 'REFERRAL_CREATED':
      return {
        label: 'Specialist Referral',
        actionLabel: 'View referral',
        icon: Send,
        badgeClass: 'bg-purple-50 text-purple-800 border-purple-200/80',
        dotClass: 'bg-purple-600 ring-purple-100',
      };

    case 'FOLLOW_UP':
    case 'FOLLOW_UP_SCHEDULED':
      return {
        label: 'Clinical Follow-up',
        actionLabel: 'View follow-up',
        icon: CalendarCheck,
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        dotClass: 'bg-emerald-600 ring-emerald-100',
      };

    case 'LAB_RESULT':
      return {
        label: 'Lab Result',
        actionLabel: 'View report',
        icon: Activity,
        badgeClass: 'bg-sky-50 text-sky-800 border-sky-200/80',
        dotClass: 'bg-sky-600 ring-sky-100',
      };

    case 'IMAGING':
      return {
        label: 'Imaging Report',
        actionLabel: 'View imaging',
        icon: FileText,
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        dotClass: 'bg-slate-600 ring-slate-200',
      };

    case 'PROCEDURE':
    case 'HOSPITALIZATION':
      return {
        label: normType === 'PROCEDURE' ? 'Clinical Procedure' : 'Hospitalization',
        actionLabel: 'View record',
        icon: HeartPulse,
        badgeClass: 'bg-rose-50 text-rose-800 border-rose-200/80',
        dotClass: 'bg-rose-600 ring-rose-100',
      };

    case 'DOCUMENT':
    case 'DOCUMENT_UPLOADED':
    case 'DOCUMENT_UPDATED':
    case 'REPORT_ADDED':
    default:
      return {
        label: 'Medical Document',
        actionLabel: 'View report',
        icon: FileText,
        badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
        dotClass: 'bg-slate-500 ring-slate-100',
      };
  }
}

export interface MonthGroup {
  monthKey: string; // "2026-10"
  monthLabel: string; // "October 2026"
  year: number;
  month: number;
  events: TimelineEventItem[];
}

/**
 * Group events chronologically by Month/Year
 */
export function groupTimelineEventsByMonth(events: TimelineEventItem[]): MonthGroup[] {
  const groupsMap = new Map<string, MonthGroup>();

  for (const evt of events) {
    const d = new Date(evt.eventDate);
    const year = evt.grouping?.year || (isNaN(d.getTime()) ? 2026 : d.getUTCFullYear());
    const month = evt.grouping?.month || (isNaN(d.getTime()) ? 1 : d.getUTCMonth() + 1);
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    
    let monthLabel = evt.grouping?.monthLabel;
    if (!monthLabel) {
      monthLabel = isNaN(d.getTime())
        ? 'Unknown Date'
        : new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
    }

    if (!groupsMap.has(monthKey)) {
      groupsMap.set(monthKey, {
        monthKey,
        monthLabel,
        year,
        month,
        events: [],
      });
    }

    groupsMap.get(monthKey)!.events.push(evt);
  }

  // Preserve descending month order
  return Array.from(groupsMap.values()).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
}

export type DateRangePreset = 'all' | '30d' | '3m' | '6m' | '1y';

export function getDateRangeFromPreset(preset: DateRangePreset): { from?: string; to?: string } {
  const now = new Date();
  switch (preset) {
    case '30d': {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return { from: d.toISOString() };
    }
    case '3m': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 3);
      return { from: d.toISOString() };
    }
    case '6m': {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 6);
      return { from: d.toISOString() };
    }
    case '1y': {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return { from: d.toISOString() };
    }
    case 'all':
    default:
      return {};
  }
}

/**
 * Calculates compact header summary stats (no fake analytics, just factual history)
 */
export function getTimelineSummaryStats(events: TimelineEventItem[], totalCount: number) {
  if (events.length === 0) {
    return {
      total: totalCount,
      yearSpan: null,
      lastActivityDate: null,
    };
  }

  const years = events
    .map((e) => new Date(e.eventDate).getUTCFullYear())
    .filter((y) => !isNaN(y))
    .sort((a, b) => a - b);

  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const yearSpan = minYear === maxYear ? String(minYear) : `${minYear} – ${maxYear}`;

  const latestDate = events[0]?.eventDate;
  const lastActivityDate = latestDate
    ? formatTimelineEventDate(latestDate, events[0]?.datePrecision, true)
    : null;

  return {
    total: totalCount,
    yearSpan,
    lastActivityDate,
  };
}
