'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLabProfile, useLabLocations, useLabTests } from '@/lib/hooks/use-lab-marketplace';
import { LabTestCategory } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  ArrowLeft,
  Building2,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Clock,
  FlaskConical,
  CheckCircle2,
  Home,
  FileCheck2,
} from 'lucide-react';

export default function LabProfilePage() {
  const params = useParams();
  const router = useRouter();
  const labId = params?.labId as string;

  const [categoryFilter, setCategoryFilter] = useState<LabTestCategory | undefined>(undefined);

  const { data: lab, isLoading: isLabLoading, error: labError } = useLabProfile(labId);
  const { data: locations, isLoading: isLocationsLoading } = useLabLocations(labId);
  const { data: tests, isLoading: isTestsLoading } = useLabTests(labId, categoryFilter);

  if (isLabLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner message="Loading laboratory facility profile..." />
      </div>
    );
  }

  if (labError || !lab) {
    return (
      <div className="max-w-xl mx-auto py-12 text-left">
        <ErrorMessage
          title="Laboratory Not Found"
          message="Could not load the requested laboratory profile."
        />
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
      </div>

      {/* Lab Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-teal-700 shrink-0" />
                <h1 className="text-xl font-bold text-slate-900">{lab.name}</h1>
                {lab.verificationStatus === 'VERIFIED' && (
                  <Badge variant="success" size="sm" dot>
                    Verified Diagnostic Center
                  </Badge>
                )}
              </div>
              {lab.legalName && (
                <p className="text-xs text-slate-500">Legal Entity: {lab.legalName}</p>
              )}
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-2">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>
                  {lab.address ? `${lab.address}, ` : ''}
                  {lab.city}, {lab.state} - {lab.pincode}
                </span>
              </p>
            </div>

            {/* License & Accreditation */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1 sm:text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Clinical License
              </span>
              <span className="font-mono font-bold text-slate-800 block">
                {lab.licenseNumber}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium flex sm:justify-end items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Certified Laboratory
              </span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
            {lab.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                <span>{lab.contactPhone}</span>
              </div>
            )}
            {lab.contactEmail && (
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                <span>{lab.contactEmail}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>Standard Clinical Hours: 07:00 - 20:00</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branch Locations */}
      {locations && locations.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-6 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span>Branch Facilities &amp; Collection Centers ({locations.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1"
                >
                  <span className="font-bold text-slate-900 block">{loc.branchName || loc.name}</span>
                  <p className="text-slate-600 text-[11px]">
                    {loc.address || loc.addressLine1}, {loc.city} - {loc.pincode}
                  </p>
                  {loc.phone && (
                    <p className="text-slate-500 text-[10px] flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3 text-slate-400" /> {loc.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Catalog */}
      <Card>
        <CardHeader className="py-3 px-6 border-b border-slate-200 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-teal-700" />
            <span>Diagnostic Test Catalog</span>
          </CardTitle>
          <div className="text-xs">
            <select
              value={categoryFilter || ''}
              onChange={(e) =>
                setCategoryFilter((e.target.value as LabTestCategory) || undefined)
              }
              className="text-xs p-1.5 rounded-md border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="">All Categories</option>
              <option value="BIOCHEMISTRY">Biochemistry</option>
              <option value="HEMATOLOGY">Hematology</option>
              <option value="MICROBIOLOGY">Microbiology</option>
              <option value="PATHOLOGY">Pathology</option>
              <option value="RADIOLOGY">Radiology</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isTestsLoading ? (
            <div className="py-8">
              <LoadingSpinner message="Loading catalog..." />
            </div>
          ) : tests && tests.length > 0 ? (
            <div className="divide-y divide-slate-100 text-xs">
              {tests.map((t: any) => (
                <div
                  key={t.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{t.name}</span>
                      <Badge variant="neutral" size="sm">
                        {t.category}
                      </Badge>
                      {t.isHomeCollection && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                          <Home className="h-3 w-3" /> Home Collection
                        </span>
                      )}
                    </div>
                    {t.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>
                    )}
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Code: {t.testCode} • Est. TAT: {t.turnaroundTime || '24 hours'}
                    </span>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="font-bold text-teal-900 text-sm">
                      ₹{t.price?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs text-center py-6">
              No tests cataloged under this category.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
