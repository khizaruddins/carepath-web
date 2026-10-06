'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useDoctorPublicProfile,
  usePatientRelationshipHistory,
} from '@/lib/hooks/use-doctor-discovery';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { DisconnectDoctorModal } from '@/components/doctor/DisconnectDoctorModal';
import { ReconnectDoctorModal } from '@/components/doctor/ReconnectDoctorModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  ShieldCheck,
  Calendar,
  Clock,
  History,
  KeyRound,
  RotateCcw,
  ArrowLeft,
  Lock,
  UserX,
  ExternalLink,
  Activity,
} from 'lucide-react';

export default function DoctorRelationshipDetailsPage() {
  const params = useParams();
  const doctorId = params.doctorId as string;

  const {
    data: doctor,
    isLoading: isDoctorLoading,
    refetch: refetchDoctor,
  } = useDoctorPublicProfile(doctorId);

  const {
    data: historyList,
    isLoading: isHistoryLoading,
    refetch: refetchHistory,
  } = usePatientRelationshipHistory();

  // Also query active consents or access requests with this doctor
  const { data: accessRequests } = useQuery({
    queryKey: ['patient-access-requests'],
    queryFn: () => doctorApi.getPatientAccessRequests(),
  });

  const [disconnectModalOpen, setDisconnectModalOpen] = useState(false);
  const [reconnectModalOpen, setReconnectModalOpen] = useState(false);

  if (isDoctorLoading || isHistoryLoading) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner message="Loading relationship details and audit timeline..." />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-left">
        <p className="text-slate-500">Doctor relationship not found.</p>
        <Link href="/app/doctors" className="mt-4 inline-block">
          <Button variant="outline" size="sm">
            Back to Doctors
          </Button>
        </Link>
      </div>
    );
  }

  const relationship = doctor.relationship;
  const isConnected = relationship.status === 'ACTIVE';
  const isPreviouslyConnected = relationship.status === 'INACTIVE';
  const isBlocked = relationship.status === 'BLOCKED';

  // Find history entry for this doctor
  const docHistory = historyList?.find((h) => h.doctorId === doctorId);

  // Check consent status
  const doctorAccess = accessRequests?.find(
    (req) => req.doctorId === doctorId && req.status === 'APPROVED',
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {/* Navigation */}
      <div>
        <Link
          href={`/app/doctors/${doctorId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-teal-800 font-medium transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dr. {doctor.fullName}&apos;s Profile
        </Link>
      </div>

      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="h-6 w-6 text-teal-700" />
              CarePath Relationship Details
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Durable care connection overview with Dr. {doctor.fullName} (
              {doctor.specialization || 'Clinical Specialist'}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 text-slate-600 hover:text-slate-900"
                onClick={() => setDisconnectModalOpen(true)}
              >
                End Relationship
              </Button>
            ) : isPreviouslyConnected ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setReconnectModalOpen(true)}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Reconnect
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Status & Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Relationship Status
            </span>
            <div className="pt-1">
              {isConnected ? (
                <Badge variant="success" size="md" dot>
                  Active Connection
                </Badge>
              ) : isPreviouslyConnected ? (
                <Badge variant="neutral" size="md" dot>
                  Previously Connected
                </Badge>
              ) : isBlocked ? (
                <Badge variant="error" size="md" dot>
                  Blocked
                </Badge>
              ) : (
                <Badge variant="neutral" size="md">
                  Not Connected
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Diagnostic Consent
            </span>
            <div className="pt-1">
              {doctorAccess ? (
                <Badge variant="brand" size="md" dot>
                  Active Access
                </Badge>
              ) : (
                <Badge variant="neutral" size="md">
                  No Active Access
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-slate-400 pt-0.5">
              {doctorAccess ? 'Vault sharing authorized' : 'Record access not granted'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardContent className="p-4 space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Consultations
            </span>
            <div className="text-lg font-bold text-slate-900 pt-0.5">
              {relationship.consultationCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                on record
              </span>
            </div>
            {relationship.lastConsultationAt && (
              <p className="text-[10px] text-slate-400">
                Last: {formatDate(relationship.lastConsultationAt)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Critical UX Distinction Callout */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4 flex items-start gap-3">
        <Lock className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-bold text-teal-950">
            CarePath Security Model & Consent Independence
          </h4>
          <p className="text-teal-900/80 leading-relaxed">
            Establishing or reconnecting a relationship connects you with this doctor in your CarePath network. <strong>It does not automatically grant vault access.</strong> Medical records and diagnostic reports require explicit, separate consent.
          </p>
          <div className="pt-1">
            <Link
              href="/app/consents"
              className="text-teal-800 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Manage Consents & Shared Records
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Event Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <History className="h-4 w-4 text-teal-700" />
            Relationship Lifecycle & Event History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {docHistory && docHistory.events && docHistory.events.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {docHistory.events.map((evt) => (
                <div key={evt.id} className="relative text-xs">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 h-3 w-3 rounded-full border-2 border-white bg-teal-600 shadow-xs" />

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {evt.eventType === 'CONNECTED'
                          ? 'Relationship Established'
                          : evt.eventType === 'RECONNECTED'
                          ? 'Relationship Reconnected'
                          : evt.eventType === 'DISCONNECTED'
                          ? 'Relationship Ended (Inactive)'
                          : evt.eventType === 'BLOCKED'
                          ? 'Doctor Blocked'
                          : evt.eventType === 'UNBLOCKED'
                          ? 'Doctor Unblocked'
                          : evt.eventType}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(evt.createdAt)}
                      </span>
                    </div>

                    {evt.reason && (
                      <p className="text-slate-600 italic">
                        Reason: &ldquo;{evt.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">
              No historical state transition events recorded.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Disconnect Modal */}
      {disconnectModalOpen && (
        <DisconnectDoctorModal
          isOpen={disconnectModalOpen}
          onClose={() => setDisconnectModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          onSuccess={() => {
            refetchDoctor();
            refetchHistory();
          }}
        />
      )}

      {/* Reconnect Modal */}
      {reconnectModalOpen && (
        <ReconnectDoctorModal
          isOpen={reconnectModalOpen}
          onClose={() => setReconnectModalOpen(false)}
          doctorId={doctor.id}
          doctorName={doctor.fullName}
          onSuccess={() => {
            refetchDoctor();
            refetchHistory();
          }}
        />
      )}
    </div>
  );
}
