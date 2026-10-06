'use client';

import React from 'react';
import Link from 'next/link';
import { DiscoveredDoctorItem, RelationshipStatus } from '@/lib/api/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  ShieldCheck,
  MapPin,
  Clock,
  Languages,
  Calendar,
  ArrowRight,
  UserCheck,
  RotateCcw,
  Building,
} from 'lucide-react';

export interface DoctorCardProps {
  doctor: DiscoveredDoctorItem;
  highlightPrevious?: boolean;
  onConnect?: (doctor: DiscoveredDoctorItem) => void;
  onReconnect?: (doctor: DiscoveredDoctorItem) => void;
  className?: string;
}

export function DoctorCard({
  doctor,
  highlightPrevious = false,
  onConnect,
  onReconnect,
  className = '',
}: DoctorCardProps) {
  const isConnected = doctor.relationshipStatus === 'ACTIVE';
  const isPreviouslyConnected = doctor.relationshipStatus === 'INACTIVE';
  const isBlocked = doctor.relationshipStatus === 'BLOCKED';

  // Get primary or first practice location
  const primaryLocation =
    doctor.practiceLocations?.find((loc) => loc.isPrimary) ||
    doctor.practiceLocations?.[0];

  return (
    <Card
      className={`transition-all hover:shadow-md ${
        highlightPrevious
          ? 'border-teal-200 bg-gradient-to-br from-teal-50/40 via-white to-white'
          : 'hover:border-slate-300'
      } ${className}`}
    >
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div>
          {/* Top Row: Identity & Status Badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {/* Doctor Avatar / Initials */}
              <div className="h-12 w-12 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 font-bold flex items-center justify-center shrink-0 text-base shadow-xs">
                {doctor.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt={doctor.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {doctor.fullName
                      ?.split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('') || 'DR'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h3 className="text-base font-bold text-slate-900 hover:text-teal-800 transition-colors">
                    <Link href={`/app/doctors/${doctor.id}`}>
                      {doctor.fullName}
                    </Link>
                  </h3>
                  <Badge variant="brand" size="sm" className="gap-1">
                    <ShieldCheck className="h-3 w-3 text-teal-700" />
                    Verified
                  </Badge>
                </div>

                <p className="text-xs font-medium text-teal-900 mt-0.5">
                  {doctor.specialization || 'General Physician'}
                  {doctor.subSpecialty && (
                    <span className="text-slate-500 font-normal">
                      {' '}
                      • {doctor.subSpecialty}
                    </span>
                  )}
                </p>

                {doctor.yearsOfExperience !== undefined && doctor.yearsOfExperience > 0 && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {doctor.yearsOfExperience} years experience
                  </p>
                )}
              </div>
            </div>

            {/* Relationship Status Badge */}
            <div className="shrink-0">
              {isConnected ? (
                <Badge variant="success" size="sm" dot>
                  Connected
                </Badge>
              ) : isPreviouslyConnected ? (
                <Badge variant="neutral" size="sm" dot>
                  Previously connected
                </Badge>
              ) : isBlocked ? (
                <Badge variant="error" size="sm" dot>
                  Blocked
                </Badge>
              ) : null}
            </div>
          </div>

          {/* Details Grid */}
          <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
            {/* Practice / Clinic */}
            {(primaryLocation || doctor.clinicName) && (
              <div className="flex items-center gap-2">
                <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">
                  {primaryLocation?.practiceName || doctor.clinicName}
                  {(primaryLocation?.area || doctor.city) && (
                    <span className="text-slate-400">
                      {' '}
                      — {primaryLocation?.area || doctor.clinicAddress || doctor.city}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Location & Distance */}
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>
                {primaryLocation?.city || doctor.city || 'India'}
                {doctor.distanceKm !== null && doctor.distanceKm !== undefined && (
                  <span className="font-semibold text-teal-800 ml-1.5">
                    • {doctor.distanceKm} km away
                  </span>
                )}
              </span>
            </div>

            {/* Languages */}
            {doctor.languages && doctor.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500">
                  {doctor.languages.join(' · ')}
                </span>
              </div>
            )}

            {/* Consultation History Banner if available */}
            {doctor.isPreviouslyConsulted && (
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-teal-800 font-medium">
                <Calendar className="h-3.5 w-3.5 text-teal-700" />
                <span>Previously consulted physician</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-xs">
            {doctor.consultationFee ? (
              <span className="font-semibold text-slate-800">
                {doctor.consultationFee}
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">CarePath Network</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isPreviouslyConnected && onReconnect ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReconnect(doctor)}
                leftIcon={<RotateCcw className="h-3.5 w-3.5 text-teal-700" />}
              >
                Reconnect
              </Button>
            ) : !isConnected && !isBlocked && onConnect ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConnect(doctor)}
                leftIcon={<UserCheck className="h-3.5 w-3.5 text-slate-600" />}
              >
                Connect
              </Button>
            ) : null}

            <Link href={`/app/doctors/${doctor.id}`}>
              <Button
                variant={isConnected ? 'primary' : 'outline'}
                size="sm"
                rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
