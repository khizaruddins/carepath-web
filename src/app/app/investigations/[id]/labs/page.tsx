'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useInvestigationDetail,
  useCompareLabs,
  useSelectLabMutation,
} from '@/lib/hooks/use-lab-marketplace';
import {
  DiscoveredLabItem,
  LabCollectionMode,
  SelectLabForInvestigationPayload,
} from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { LabComparisonModal } from '@/components/lab/LabComparisonModal';
import { LabSelectionConfirmModal } from '@/components/lab/LabSelectionConfirmModal';
import {
  ArrowLeft,
  FlaskConical,
  MapPin,
  Clock,
  Home,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Compass,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function InvestigationLabDiscoveryPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  // Filter & Search states
  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const [collectionModeFilter, setCollectionModeFilter] = useState<LabCollectionMode | undefined>(
    undefined,
  );
  const [sortOption, setSortOption] = useState<'BEST_MATCH' | 'NEARBY' | 'CHEAPEST' | 'FASTEST'>(
    'BEST_MATCH',
  );
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  // Comparison selection state (up to 4 labs)
  const [selectedForComparison, setSelectedForComparison] = useState<DiscoveredLabItem[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Booking selection state
  const [labToBook, setLabToBook] = useState<DiscoveredLabItem | null>(null);
  const [bookingSuccessMessage, setBookingSuccessMessage] = useState<string | null>(null);

  // Fetch investigation details
  const {
    data: investigation,
    isLoading: isInvLoading,
    error: invError,
  } = useInvestigationDetail(id);

  // Compare & discover labs for this specific investigation
  const {
    data: comparisonData,
    isLoading: isLabsLoading,
    error: labsError,
    refetch: refetchLabs,
  } = useCompareLabs(id, {
    latitude: coords.latitude,
    longitude: coords.longitude,
    collectionMode: collectionModeFilter,
    sort: sortOption,
  });

  const selectLabMutation = useSelectLabMutation(id);

  // Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setLocationStatus('Detecting your GPS location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocationStatus('Location detected: Showing nearby diagnostic centers');
      },
      (err) => {
        setLocationStatus('Location access denied. Showing all verified laboratories.');
        console.warn('Geolocation error:', err);
      },
      { timeout: 8000 },
    );
  };

  // Toggle selection for side-by-side comparison
  const toggleComparison = (labItem: DiscoveredLabItem) => {
    const exists = selectedForComparison.some((item) => item.lab.id === labItem.lab.id);
    if (exists) {
      setSelectedForComparison(selectedForComparison.filter((i) => i.lab.id !== labItem.lab.id));
    } else {
      if (selectedForComparison.length >= 4) {
        alert('You can compare a maximum of 4 diagnostic centers at a time.');
        return;
      }
      setSelectedForComparison([...selectedForComparison, labItem]);
    }
  };

  // Confirm booking handler
  const handleConfirmBooking = async (payload: {
    labId: string;
    collectionMode: LabCollectionMode;
    collectionAddress?: string;
    preferredDate?: string;
  }) => {
    try {
      await selectLabMutation.mutateAsync({
        labId: payload.labId,
        collectionMode: payload.collectionMode,
        collectionAddress: payload.collectionAddress,
        preferredDate: payload.preferredDate,
        notes: investigation?.instructions || undefined,
      });
      setLabToBook(null);
      setBookingSuccessMessage('Diagnostic center booked! Navigating to your order tracking...');
      setTimeout(() => {
        router.push(`/app/investigations/${id}`);
      }, 1200);
    } catch (err: any) {
      console.error('Booking failed', err);
      alert(err.message || 'Failed to select diagnostic center.');
    }
  };

  if (isInvLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Loading investigation request details..." />
      </div>
    );
  }

  if (invError || !investigation) {
    return (
      <div className="max-w-xl mx-auto py-12 text-left">
        <ErrorMessage
          title="Investigation Not Found"
          message="Could not load investigation request details."
        />
        <div className="mt-4">
          <Link href="/app/investigations">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Back to Investigations
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const labs = comparisonData?.labs || comparisonData?.comparison || [];

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link href={`/app/investigations/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Investigation
          </Button>
        </Link>
      </div>

      {/* Investigation Prescription Context Header */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-teal-800" />
            <h1 className="text-lg font-bold text-teal-950">
              Diagnostic Labs for {investigation.testName || investigation.investigationName || 'Prescribed Investigation'}
            </h1>
          </div>
          <p className="text-xs text-teal-800/90 mt-1">
            Prescribed by Dr.{' '}
            <strong>{investigation.doctor?.user?.profile?.fullName || 'Physician'}</strong>
            {investigation.instructions && ` • Prep: ${investigation.instructions}`}
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {comparisonData?.canonicalTest && (
            <Badge variant="brand" size="sm">
              Standardized Test Match
            </Badge>
          )}
        </div>
      </div>

      {/* Location Search & Filter Controls */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            {/* GPS Location Auto-detect */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDetectLocation}
                leftIcon={<Compass className="h-3.5 w-3.5 text-teal-700" />}
              >
                Use Current Location
              </Button>
              {locationStatus && (
                <span className="text-[11px] text-slate-500 italic">{locationStatus}</span>
              )}
            </div>

            {/* Filter by Collection Mode & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Collection:</span>
                <select
                  value={collectionModeFilter || ''}
                  onChange={(e) =>
                    setCollectionModeFilter(
                      (e.target.value as LabCollectionMode) || undefined,
                    )
                  }
                  className="text-xs p-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="">All Modes</option>
                  <option value="FACILITY_VISIT">Center Visit Only</option>
                  <option value="HOME_COLLECTION">Home Collection Available</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="text-xs p-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
                >
                  <option value="BEST_MATCH">Best Match (Quality &amp; Distance)</option>
                  <option value="CHEAPEST">Cheapest Test Price</option>
                  <option value="FASTEST">Fastest Turnaround Time</option>
                  <option value="NEARBY">Nearest Distance</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Notification if Booked */}
      {bookingSuccessMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{bookingSuccessMessage}</span>
        </div>
      )}

      {/* Active Comparison Floating Bar (if 2+ labs selected) */}
      {selectedForComparison.length > 0 && (
        <div className="sticky top-4 z-30 p-3 rounded-lg bg-slate-900 text-white shadow-lg flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-teal-400" />
            <span>
              <strong>{selectedForComparison.length}</strong> centers selected for side-by-side
              comparison (max 4).
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedForComparison([])}
              className="text-white border-slate-700 hover:bg-slate-800"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsComparisonModalOpen(true)}
            >
              Compare Side-by-Side
            </Button>
          </div>
        </div>
      )}

      {/* Labs Discovery Grid */}
      {isLabsLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Comparing accredited diagnostic centers..." />
        </div>
      ) : labs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {labs.map((item) => {
            const isSelected = selectedForComparison.some((i) => i.lab.id === item.lab.id);

            return (
              <Card
                key={item.lab.id}
                className={`hover:border-teal-700/50 transition-all flex flex-col justify-between ${
                  isSelected ? 'border-teal-700 ring-1 ring-teal-700/30' : ''
                }`}
              >
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-teal-700 shrink-0" />
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {item.lab.name}
                      </CardTitle>
                    </div>
                    {item.location && (
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>
                          {item.location.branchName} • {item.location.city}
                          {item.distanceKm !== undefined && (
                            <strong className="text-slate-700 ml-1">
                              ({item.distanceKm.toFixed(1)} km)
                            </strong>
                          )}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {item.pricing.isAccredited && (
                      <Badge variant="success" size="sm">
                        NABL Accredited
                      </Badge>
                    )}
                    <span className="text-[10px] text-slate-400">
                      Score: {item.matchScore} pts
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  {/* Pricing and Logistics Highlights */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Test Base Price
                        </span>
                        <span className="text-lg font-bold text-teal-900">
                          ₹{(item.pricing.testPrice ?? item.pricing.basePrice ?? 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Est. Turnaround
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center justify-end gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {item.tat}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                      <div className="flex items-center gap-1.5">
                        <Home className="h-3.5 w-3.5 text-teal-700" />
                        {item.isHomeCollectionAvailable ? (
                          <span>
                            Home Collection (+₹{item.pricing.homeCollectionFee})
                          </span>
                        ) : (
                          <span className="text-slate-400">Center Visit Only</span>
                        )}
                      </div>
                      {item.sampleTypes && item.sampleTypes.length > 0 && (
                        <span className="text-slate-500">
                          Sample: {item.sampleTypes[0]}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Compare Checkbox */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => toggleComparison(item)}
                      className="flex items-center gap-1.5 text-[11px] text-slate-600 hover:text-slate-900 select-none py-1"
                    >
                      {isSelected ? (
                        <CheckSquare className="h-4 w-4 text-teal-700" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-300" />
                      )}
                      <span>Compare</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link href={`/app/labs/${item.lab.id}`}>
                        <Button variant="ghost" size="sm" className="text-slate-600">
                          Lab Profile
                        </Button>
                      </Link>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setLabToBook(item)}
                      >
                        Book Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No diagnostic laboratories found"
          description="No participating diagnostic centers matched your test and location criteria. Try expanding your search radius or clearing collection mode filters."
          icon={<FlaskConical className="h-8 w-8 text-teal-700" />}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCollectionModeFilter(undefined);
                setSortOption('BEST_MATCH');
                setCoords({});
              }}
            >
              Reset Search Filters
            </Button>
          }
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      <LabComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        labs={selectedForComparison}
        onSelectLab={(labItem) => {
          setIsComparisonModalOpen(false);
          setLabToBook(labItem);
        }}
      />

      {/* Lab Selection & Clinical Consent Confirmation Modal */}
      <LabSelectionConfirmModal
        isOpen={!!labToBook}
        onClose={() => setLabToBook(null)}
        labItem={labToBook}
        investigation={investigation}
        onConfirm={handleConfirmBooking}
        isLoading={selectLabMutation.isPending}
      />
    </div>
  );
}
