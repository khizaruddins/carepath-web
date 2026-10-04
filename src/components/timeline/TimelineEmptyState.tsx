import React from 'react';
import Link from 'next/link';
import { Clock, Plus, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

interface TimelineEmptyStateProps {
  hasActiveFilters?: boolean;
  isDoctorView?: boolean;
  onResetFilters?: () => void;
  onUploadClick?: () => void;
}

export function TimelineEmptyState({
  hasActiveFilters = false,
  isDoctorView = false,
  onResetFilters,
  onUploadClick,
}: TimelineEmptyStateProps) {
  if (hasActiveFilters) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-3">
          <Clock className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No matching events found</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
          We couldn’t find any healthcare records matching your current filter criteria or search keyword.
        </p>
        {onResetFilters && (
          <div className="mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={onResetFilters}
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (isDoctorView) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
        <div className="h-10 w-10 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-700 mb-3">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-slate-900">No Authorized Records</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
          No medical records have been shared under active patient consent for this timeframe.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs">
      <div className="h-11 w-11 rounded-full bg-teal-50 flex items-center justify-center mx-auto text-teal-700 mb-3.5">
        <Clock className="h-5 w-5" />
      </div>
      <h3 className="text-base font-bold text-slate-900">Your timeline is empty</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
        As you add health records, consultations, reports, prescriptions and other healthcare events, they’ll appear here chronologically.
      </p>
      <div className="mt-5 flex justify-center">
        {onUploadClick ? (
          <Button size="sm" onClick={onUploadClick} leftIcon={<Plus className="h-4 w-4" />}>
            Upload a health record
          </Button>
        ) : (
          <Link href="/app/documents">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Upload a health record
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
