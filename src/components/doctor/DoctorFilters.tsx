'use client';

import React from 'react';
import { DiscoverDoctorsParams } from '@/lib/api/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X, Filter, RotateCcw, MapPin } from 'lucide-react';

export interface DoctorFiltersProps {
  filters: DiscoverDoctorsParams;
  onChange: (updated: Partial<DiscoverDoctorsParams>) => void;
  onClear: () => void;
  totalResults?: number;
  className?: string;
  isMobileModal?: boolean;
  onCloseMobile?: () => void;
}

const COMMON_SPECIALTIES = [
  { label: 'All Specialties', value: '' },
  { label: 'Cardiology', value: 'Cardiology' },
  { label: 'Dermatology', value: 'Dermatology' },
  { label: 'Neurology', value: 'Neurology' },
  { label: 'General Medicine', value: 'General Medicine' },
  { label: 'Orthopedics', value: 'Orthopedics' },
  { label: 'Pediatrics', value: 'Pediatrics' },
  { label: 'Gynecology & Obstetrics', value: 'Gynecology' },
  { label: 'Oncology', value: 'Oncology' },
  { label: 'ENT (Otolaryngology)', value: 'ENT' },
  { label: 'Ophthalmology', value: 'Ophthalmology' },
  { label: 'Psychiatry', value: 'Psychiatry' },
  { label: 'Pulmonology', value: 'Pulmonology' },
  { label: 'Gastroenterology', value: 'Gastroenterology' },
  { label: 'Endocrinology', value: 'Endocrinology' },
];

const EXPERIENCE_OPTIONS = [
  { label: 'Any Experience', value: '' },
  { label: '3+ Years', value: '3' },
  { label: '5+ Years', value: '5' },
  { label: '10+ Years', value: '10' },
  { label: '15+ Years', value: '15' },
  { label: '20+ Years', value: '20' },
];

const GENDER_OPTIONS = [
  { label: 'Any Gender', value: '' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Male', value: 'MALE' },
  { label: 'Other', value: 'OTHER' },
];

const RADIUS_OPTIONS = [
  { label: '5 km radius', value: '5' },
  { label: '10 km radius', value: '10' },
  { label: '25 km radius', value: '25' },
  { label: '50 km radius', value: '50' },
];

const SORT_OPTIONS = [
  { label: 'Best Match (Default)', value: 'relevance' },
  { label: 'Experience (High to Low)', value: 'experience_desc' },
  { label: 'Nearby (Distance)', value: 'distance' },
  { label: 'Fee: Low to High', value: 'fee_asc' },
  { label: 'Fee: High to Low', value: 'fee_desc' },
];

export function DoctorFilters({
  filters,
  onChange,
  onClear,
  totalResults,
  className = '',
  isMobileModal = false,
  onCloseMobile,
}: DoctorFiltersProps) {
  // Count active filter controls (excluding sort & page)
  const activeCount = [
    filters.specialty,
    filters.subspecialty,
    filters.city,
    filters.area,
    filters.pincode,
    filters.gender,
    filters.language,
    filters.experienceMin,
    filters.radius && filters.radius !== 25,
  ].filter(Boolean).length;

  return (
    <div className={`space-y-5 text-left ${className}`}>
      {/* Filters Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-teal-700" />
          <h3 className="text-sm font-bold text-slate-900">Filter Doctors</h3>
          {activeCount > 0 && (
            <Badge variant="brand" size="sm">
              {activeCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium transition-colors"
            >
              Clear all
            </button>
          )}
          {isMobileModal && onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Sort Results
        </label>
        <Select
          value={filters.sort || 'relevance'}
          onChange={(e) => onChange({ sort: e.target.value as any, page: 1 })}
          options={SORT_OPTIONS}
        />
      </div>

      {/* Specialty Filter */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Clinical Specialty
        </label>
        <Select
          value={filters.specialty || ''}
          onChange={(e) => onChange({ specialty: e.target.value || undefined, page: 1 })}
          options={COMMON_SPECIALTIES}
        />
      </div>

      {/* Subspecialty Filter */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Subspecialty Focus
        </label>
        <Input
          placeholder="e.g. Pediatric, Spine, Retina"
          value={filters.subspecialty || ''}
          onChange={(e) => onChange({ subspecialty: e.target.value || undefined, page: 1 })}
        />
      </div>

      {/* Location Constraints */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <span className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Location & Radius
        </span>

        <div className="space-y-2">
          <Input
            placeholder="City (e.g. Bangalore, Mumbai)"
            value={filters.city || ''}
            onChange={(e) => onChange({ city: e.target.value || undefined, page: 1 })}
            leftIcon={<MapPin className="h-3.5 w-3.5 text-slate-400" />}
          />

          <Input
            placeholder="Area / Locality (e.g. Andheri, Indiranagar)"
            value={filters.area || ''}
            onChange={(e) => onChange({ area: e.target.value || undefined, page: 1 })}
          />

          <Input
            placeholder="Pincode (e.g. 560038)"
            value={filters.pincode || ''}
            onChange={(e) => onChange({ pincode: e.target.value || undefined, page: 1 })}
          />

          {filters.latitude !== undefined && filters.longitude !== undefined && (
            <div className="space-y-1 pt-1">
              <label className="block text-[11px] text-slate-500 font-medium">
                Search Radius
              </label>
              <Select
                value={String(filters.radius || 25)}
                onChange={(e) => onChange({ radius: Number(e.target.value), page: 1 })}
                options={RADIUS_OPTIONS}
              />
            </div>
          )}
        </div>
      </div>

      {/* Experience Filter */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Experience
        </label>
        <Select
          value={filters.experienceMin ? String(filters.experienceMin) : ''}
          onChange={(e) =>
            onChange({
              experienceMin: e.target.value ? Number(e.target.value) : undefined,
              page: 1,
            })
          }
          options={EXPERIENCE_OPTIONS}
        />
      </div>

      {/* Gender Filter */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Doctor Gender
        </label>
        <Select
          value={filters.gender || ''}
          onChange={(e) => onChange({ gender: e.target.value || undefined, page: 1 })}
          options={GENDER_OPTIONS}
        />
      </div>

      {/* Language Spoken */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Language Spoken
        </label>
        <Input
          placeholder="e.g. Hindi, English, Marathi, Tamil"
          value={filters.language || ''}
          onChange={(e) => onChange({ language: e.target.value || undefined, page: 1 })}
        />
      </div>

      {isMobileModal && (
        <div className="pt-4 border-t border-slate-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={onCloseMobile}
          >
            Show Results {totalResults !== undefined ? `(${totalResults})` : ''}
          </Button>
        </div>
      )}
    </div>
  );
}
