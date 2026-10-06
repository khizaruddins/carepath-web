'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDoctorPublicProfile } from '@/lib/hooks/use-doctor-discovery';
import { ConnectDoctorModal } from '@/components/doctor/ConnectDoctorModal';
import { ReconnectDoctorModal } from '@/components/doctor/ReconnectDoctorModal';
import { DisconnectDoctorModal } from '@/components/doctor/DisconnectDoctorModal';
import { BlockDoctorModal } from '@/components/doctor/BlockDoctorModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  ShieldCheck,
  Award,
  GraduationCap,
  Languages,
  Building,
  MapPin,
  Clock,
  Phone,
  UserCheck,
  RotateCcw,
  UserX,
  ShieldAlert,
  Calendar,
  Lock,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params.doctorId as string;

  const {
    data: doctor,
    isLoading,
    isError,
    refetch,
  } = useDoctorPublicProfile(doctorId);

  // Modals state
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [reconnectModalOpen, setReconnectModalOpen] = useState(false);
  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner message="Retrieving clinician credentials & profile..." />
      </div>
    );
  }

  if (isError || !doctor) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-left">
        <EmptyState
          icon={<ShieldAlert className="h-10 w-10 text-rose-500" />}
          title="Physician profile unavailable"
          description="This doctor profile could not be found or is not currently active on the CarePath verified network."
          action={
            <Link href="/app/doctors">
              <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
                Back to Doctor Directory
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const relationship = doctor.relationship;
  const isConnected = relationship.status === 'ACTIVE';
  const isPreviouslyConnected = relationship.status === 'INACTIVE';
  const isBlocked = relationship.status === 'BLOCKED';

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Back button */}
      <div>
        <Link
          href="/app/doctors"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-800 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Doctor Discovery
        </Link>
      </div>

      {/* Profile Header Card */}
      <Card className="border-slate-200 overflow-hidden shadow-xs">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Doctor Avatar */}
              <div className="h-20 w-20 rounded-full bg-teal-100 border-2 border-teal-200 text-teal-800 font-bold flex items-center justify-center shrink-0 text-xl shadow-xs">
                {doctor.profilePhoto ? (
                  <img
                    src={doctor.profilePhoto}
                    alt={doctor.fullName}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span>
                    {doctor.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {doctor.fullName}
                  </h1>
                  <Badge variant="brand" size="sm" className="gap-1 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                    Verified CarePath Doctor
                  </Badge>
                </div>

                <p className="text-sm font-semibold text-teal-900">
                  {doctor.specialization || 'Clinical Specialist'}
                  {doctor.subSpecialty && (
                    <span className="text-slate-500 font-normal">
                      {' '}
                      • {doctor.subSpecialty}
                    </span>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
                  {doctor.yearsOfExperience !== undefined && doctor.yearsOfExperience > 0 && (
                    <span className="flex items-center gap-1">
                      <Award className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.yearsOfExperience} years clinical experience
                    </span>
                  )}
                  {doctor.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {doctor.city}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verification Assurance Tag */}
            <div className="rounded-lg bg-teal-50/70 border border-teal-200/80 p-3 text-xs text-teal-950 space-y-1 sm:max-w-xs shrink-0">
              <span className="font-bold flex items-center gap-1 text-teal-900">
                <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0" />
                Verified Registration
              </span>
              <p className="text-[11px] text-teal-900/80 leading-relaxed">
                CarePath has verified this doctor&apos;s registration and credentials.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship Management Banner */}
      <Card
        className={`border ${
          isConnected
            ? 'border-emerald-300 bg-emerald-50/40'
            : isPreviouslyConnected
            ? 'border-slate-300 bg-slate-50/60'
            : isBlocked
            ? 'border-rose-200 bg-rose-50/50'
            : 'border-teal-200 bg-teal-50/30'
        }`}
      >
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Your Relationship:
                </span>
                {isConnected ? (
                  <Badge variant="success" size="sm" dot>
                    Connected (Active)
                  </Badge>
                ) : isPreviouslyConnected ? (
                  <Badge variant="neutral" size="sm" dot>
                    Previously Connected
                  </Badge>
                ) : isBlocked ? (
                  <Badge variant="error" size="sm" dot>
                    Blocked
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Not Connected
                  </Badge>
                )}
              </div>

              <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-0.5">
                {relationship.lastConsultationAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Last consultation: {formatDate(relationship.lastConsultationAt)}
                  </span>
                )}
                {relationship.consultationCount > 0 && (
                  <span>
                    • {relationship.consultationCount} consultation
                    {relationship.consultationCount === 1 ? '' : 's'} on record
                  </span>
                )}
              </div>

              {/* Security model reassurance */}
              <p className="text-[11px] text-slate-500 pt-1">
                Connecting establishes a professional link in your care network. It does not automatically grant medical record access — record sharing is controlled via CarePath Consent.
              </p>
            </div>

            {/* Relationship Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {isConnected ? (
                <>
                  <Link href={`/app/doctors/${doctorId}/relationship`}>
                    <Button variant="outline" size="sm">
                      View Relationship
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:text-slate-900"
                    onClick={() => setDisconnectModalOpen(true)}
                  >
                    End Relationship
                  </Button>
                </>
              ) : isPreviouslyConnected ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setReconnectModalOpen(true)}
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Reconnect
                  </Button>
                  <Link href={`/app/doctors/${doctorId}/relationship`}>
                    <Button variant="outline" size="sm">
                      View History
                    </Button>
                  </Link>
                </>
              ) : isBlocked ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setReconnectModalOpen(true)}
                >
                  Unblock Doctor
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setConnectModalOpen(true)}
                  leftIcon={<UserCheck className="h-3.5 w-3.5" />}
                >
                  Connect with Doctor
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Qualifications, Practice, About */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Info className="h-4 w-4 text-teal-700" />
                About Dr. {doctor.fullName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {doctor.bio || 'Professional information not provided.'}
              </p>
            </CardContent>
          </Card>

          {/* Practice Locations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building className="h-4 w-4 text-teal-700" />
                Practice Locations ({doctor.practiceLocations?.length || 1})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctor.practiceLocations && doctor.practiceLocations.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {doctor.practiceLocations.map((loc) => (
                    <div key={loc.id} className="py-3 first:pt-0 last:pb-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {loc.practiceName}
                        </span>
                        {loc.isPrimary && (
                          <Badge variant="brand" size="sm">
                            Primary Practice
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-600">
                        {loc.addressLine1}
                        {loc.addressLine2 && `, ${loc.addressLine2}`}
                        {loc.area && `, ${loc.area}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {loc.city}
                        {loc.state && `, ${loc.state}`}
                        {loc.pincode && ` - ${loc.pincode}`}
                      </p>
                      {loc.phone && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 pt-0.5">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {loc.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : doctor.clinicName || doctor.clinicAddress ? (
                <div className="space-y-1 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block">
                    {doctor.clinicName || 'Clinical Office'}
                  </span>
                  <p>{doctor.clinicAddress}</p>
                  <p>{doctor.city}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Practice location details not specified.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Education & Qualifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-teal-700" />
                Qualifications & Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Medical Qualifications
                </span>
                <p className="text-xs text-slate-900 font-medium">
                  {doctor.qualifications || 'Medical credentials on record.'}
                </p>
              </div>

              {doctor.education && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Education & Training
                  </span>
                  <p className="text-xs text-slate-700">{doctor.education}</p>
                </div>
              )}

              {doctor.hospitalAffiliation && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                    Hospital Affiliation
                  </span>
                  <p className="text-xs text-slate-700">
                    {doctor.hospitalAffiliation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Consultation Metadata & Languages */}
        <div className="space-y-6">
          {/* Consultation Fee & Modes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">
                Consultation Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">Fee</span>
                <span className="text-sm font-bold text-slate-900">
                  {doctor.consultationFee || 'Standard Practice Fee'}
                </span>
              </div>

              {doctor.consultationMode && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block text-[11px]">
                    Consultation Mode
                  </span>
                  <span className="font-medium text-slate-800">
                    {doctor.consultationMode.replace('_', ' ')}
                  </span>
                </div>
              )}

              {doctor.workingHours && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-500 block text-[11px]">
                    Operating Hours
                  </span>
                  <span className="font-medium text-slate-800">
                    {doctor.workingHours}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Languages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Languages className="h-4 w-4 text-teal-700" />
                Languages Spoken
              </CardTitle>
            </CardHeader>
            <CardContent>
              {doctor.languages && doctor.languages.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {doctor.languages.map((lang) => (
                    <Badge key={lang} variant="neutral" size="sm">
                      {lang}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-500">
                  English, Hindi
                </span>
              )}
            </CardContent>
          </Card>

          {/* Privacy & Governance Notice */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-teal-700" />
              Patient-Governed Privacy
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              CarePath ensures that connecting with a clinician does not give them unfettered access to your health documents. You explicitly choose when and what records to share.
            </p>
          </div>
        </div>
      </div>

      {/* Connect Modal */}
      {connectModalOpen && (
        <ConnectDoctorModal
          isOpen={connectModalOpen}
          onClose={() => setConnectModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          specialization={doctor.specialization}
          onSuccess={() => refetch()}
        />
      )}

      {/* Reconnect Modal */}
      {reconnectModalOpen && (
        <ReconnectDoctorModal
          isOpen={reconnectModalOpen}
          onClose={() => setReconnectModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          onSuccess={() => refetch()}
        />
      )}

      {/* Disconnect Modal */}
      {disconnectModalOpen && (
        <DisconnectDoctorModal
          isOpen={disconnectModalOpen}
          onClose={() => setDisconnectModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          onSuccess={() => refetch()}
        />
      )}

      {/* Block Modal */}
      {blockModalOpen && (
        <BlockDoctorModal
          isOpen={blockModalOpen}
          onClose={() => setBlockModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
