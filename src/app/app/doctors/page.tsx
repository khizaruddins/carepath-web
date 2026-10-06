'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import {
  useDiscoverDoctors,
  usePreviouslyConsultedDoctors,
  usePatientDoctors,
} from '@/lib/hooks/use-doctor-discovery';
import { DiscoverDoctorsParams, DiscoveredDoctorItem } from '@/lib/api/types';
import { DoctorCard } from '@/components/doctor/DoctorCard';
import { DoctorFilters } from '@/components/doctor/DoctorFilters';
import { ConnectDoctorModal } from '@/components/doctor/ConnectDoctorModal';
import { ReconnectDoctorModal } from '@/components/doctor/ReconnectDoctorModal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import {
  Stethoscope,
  Search,
  MapPin,
  Compass,
  Filter,
  History,
  Users,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export default function DoctorDiscoveryPage() {
  const { user } = useAuth();

  // Search & Filter State
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<DiscoverDoctorsParams>({
    page: 1,
    limit: 10,
    sort: 'relevance',
  });

  // Mobile Filter Dialog
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Geolocation state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Modal State
  const [selectedDoctorForConnect, setSelectedDoctorForConnect] =
    useState<DiscoveredDoctorItem | null>(null);
  const [selectedDoctorForReconnect, setSelectedDoctorForReconnect] =
    useState<DiscoveredDoctorItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        q: searchInput.trim() || undefined,
        page: 1,
      }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Request browser location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        setFilters((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          page: 1,
        }));
      },
      (err) => {
        setGeoLoading(false);
        setGeoError(
          'Location access isn\'t available. Please enter a city or pincode manually below.',
        );
      },
      { timeout: 8000 },
    );
  };

  const handleClearLocation = () => {
    setFilters((prev) => {
      const copy = { ...prev };
      delete copy.latitude;
      delete copy.longitude;
      delete copy.city;
      delete copy.area;
      delete copy.pincode;
      return { ...copy, page: 1 };
    });
    setGeoError(null);
  };

  const handleFilterChange = (updated: Partial<DiscoverDoctorsParams>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 1,
      limit: 10,
      sort: 'relevance',
    });
    setGeoError(null);
  };

  // Queries
  const {
    data: discoveryData,
    isLoading: isDiscoveryLoading,
    isError: isDiscoveryError,
    refetch: refetchDoctors,
  } = useDiscoverDoctors(filters);

  // Fetch previous doctors (tier 1 / tier 2 context) for patient
  const { data: previousDoctorsList } = usePreviouslyConsultedDoctors();
  const { data: connectedDoctorsList } = usePatientDoctors();

  const totalResults = discoveryData?.pagination?.total || 0;
  const currentPage = discoveryData?.pagination?.page || 1;
  const totalPages = discoveryData?.pagination?.totalPages || 1;
  const doctors = discoveryData?.doctors || [];

  // Separate "Your previous doctors" (if any appear in the search results or prominently)
  const previousDoctors = doctors.filter(
    (doc) => doc.isPreviouslyConsulted || doc.relationshipStatus === 'INACTIVE',
  );
  const otherDoctors = doctors.filter(
    (doc) => !doc.isPreviouslyConsulted && doc.relationshipStatus !== 'INACTIVE',
  );

  const hasLocationApplied =
    filters.latitude !== undefined ||
    filters.city !== undefined ||
    filters.pincode !== undefined;

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Stethoscope className="h-6 w-6 text-teal-700" />
            Find a Doctor
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search verified doctors by specialty, location, experience and more.
          </p>
        </div>

        {/* Quick Nav Tabs */}
        <div className="flex items-center gap-2">
          <Link href="/app/doctors/my-doctors">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Users className="h-3.5 w-3.5 text-teal-700" />}
            >
              My Doctors
              {connectedDoctorsList && connectedDoctorsList.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded-full text-[10px] font-bold">
                  {connectedDoctorsList.length}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/app/doctors/history">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<History className="h-3.5 w-3.5 text-slate-500" />}
            >
              History
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Search & Location Control Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Main Search Input */}
          <div className="flex-1">
            <Input
              placeholder="Search doctor, specialty or clinic..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              aria-label="Search doctor, specialty or clinic"
            />
          </div>

          {/* Location Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="md"
              onClick={handleUseCurrentLocation}
              isLoading={geoLoading}
              leftIcon={<Compass className="h-4 w-4 text-teal-700" />}
              className="text-xs shrink-0"
            >
              Use current location
            </Button>

            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="md"
              onClick={() => setMobileFiltersOpen(true)}
              leftIcon={<Filter className="h-4 w-4 text-slate-500" />}
              className="md:hidden text-xs shrink-0"
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Location Status / Feedback Banner */}
        {geoError && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{geoError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeoError(null)}
              className="text-amber-700 hover:text-amber-900"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {hasLocationApplied && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-teal-700" />
            <span>
              Searching near:{' '}
              <strong>
                {filters.city ||
                  filters.pincode ||
                  (filters.latitude
                    ? `${filters.latitude.toFixed(2)}, ${filters.longitude?.toFixed(2)}`
                    : '')}
              </strong>{' '}
              ({filters.radius || 25} km radius)
            </span>
            <button
              type="button"
              onClick={handleClearLocation}
              className="text-xs text-teal-700 hover:text-teal-900 font-medium ml-2 underline"
            >
              Reset location
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Desktop 2-Column (Sidebar Filters + Results) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block col-span-1 bg-white rounded-xl border border-slate-200 p-4 shadow-xs sticky top-20">
          <DoctorFilters
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            totalResults={totalResults}
          />
        </div>

        {/* Results Stream (Col-span-3) */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {/* Results Summary Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing{' '}
              <strong className="text-slate-800">
                {isDiscoveryLoading ? '...' : totalResults}
              </strong>{' '}
              verified {totalResults === 1 ? 'doctor' : 'doctors'}
            </span>

            {/* Quick Sort Display */}
            <span className="hidden sm:inline">
              Sorted by:{' '}
              <strong className="text-slate-700">
                {filters.sort === 'experience_desc'
                  ? 'Experience'
                  : filters.sort === 'distance'
                  ? 'Distance'
                  : filters.sort === 'fee_asc'
                  ? 'Fee: Low to High'
                  : filters.sort === 'fee_desc'
                  ? 'Fee: High to Low'
                  : 'Best Match'}
              </strong>
            </span>
          </div>

          {/* Loading State */}
          {isDiscoveryLoading ? (
            <div className="py-20">
              <LoadingSpinner message="Searching verified doctors directory..." />
            </div>
          ) : isDiscoveryError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-xs text-rose-800 space-y-2">
              <AlertCircle className="h-6 w-6 text-rose-600 mx-auto" />
              <h3 className="text-sm font-bold text-rose-950">
                Unable to load doctor directory
              </h3>
              <p>There was a network issue retrieving physicians. Please try again.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchDoctors()}
                className="mt-2"
              >
                Retry Search
              </Button>
            </div>
          ) : doctors.length > 0 ? (
            <div className="space-y-6">
              {/* SECTION 1: Your Previous Doctors (Prioritized) */}
              {previousDoctors.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-teal-700" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Your previous doctors ({previousDoctors.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {previousDoctors.map((doc) => (
                      <DoctorCard
                        key={`prev-${doc.id}`}
                        doctor={doc}
                        highlightPrevious={true}
                        onConnect={(d) => setSelectedDoctorForConnect(d)}
                        onReconnect={(d) => setSelectedDoctorForReconnect(d)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Verified Doctors Near You / Results */}
              <div className="space-y-3">
                {previousDoctors.length > 0 && otherDoctors.length > 0 && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <ShieldCheck className="h-4 w-4 text-teal-700" />
                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      Verified doctors near you
                    </h2>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  {otherDoctors.map((doc) => (
                    <DoctorCard
                      key={doc.id}
                      doctor={doc}
                      onConnect={(d) => setSelectedDoctorForConnect(d)}
                      onReconnect={(d) => setSelectedDoctorForReconnect(d)}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, (prev.page || 1) - 1),
                      }))
                    }
                    leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
                  >
                    Previous
                  </Button>

                  <span className="text-xs text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: (prev.page || 1) + 1,
                      }))
                    }
                    rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={<Stethoscope className="h-8 w-8 text-slate-400" />}
              title="No verified doctors match your search"
              description="Try broadening your location, selecting another clinical specialty, or increasing your search radius."
              action={
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              }
            />
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <Dialog
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        title="Filter Doctors"
        description="Refine verified physician discovery"
        maxWidth="md"
      >
        <DoctorFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          totalResults={totalResults}
          isMobileModal={true}
          onCloseMobile={() => setMobileFiltersOpen(false)}
        />
      </Dialog>

      {/* Connect Doctor Modal */}
      {selectedDoctorForConnect && (
        <ConnectDoctorModal
          isOpen={!!selectedDoctorForConnect}
          onClose={() => setSelectedDoctorForConnect(null)}
          doctorId={selectedDoctorForConnect.id}
          doctorName={selectedDoctorForConnect.fullName}
          specialization={selectedDoctorForConnect.specialization}
          onSuccess={() => refetchDoctors()}
        />
      )}

      {/* Reconnect Doctor Modal */}
      {selectedDoctorForReconnect && (
        <ReconnectDoctorModal
          isOpen={!!selectedDoctorForReconnect}
          onClose={() => setSelectedDoctorForReconnect(null)}
          doctorId={selectedDoctorForReconnect.id}
          doctorName={selectedDoctorForReconnect.fullName}
          onSuccess={() => refetchDoctors()}
        />
      )}
    </div>
  );
}
