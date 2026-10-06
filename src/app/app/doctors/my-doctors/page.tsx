'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  usePatientDoctors,
  usePreviouslyConsultedDoctors,
} from '@/lib/hooks/use-doctor-discovery';
import { DisconnectDoctorModal } from '@/components/doctor/DisconnectDoctorModal';
import { ReconnectDoctorModal } from '@/components/doctor/ReconnectDoctorModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import {
  Users,
  Stethoscope,
  Calendar,
  Building,
  RotateCcw,
  ArrowRight,
  Plus,
  ShieldCheck,
  UserX,
  History,
  Activity,
} from 'lucide-react';

export default function MyDoctorsPage() {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PREVIOUS' | 'CONSULTED'>('ACTIVE');

  // Query connected doctors (active and inactive)
  const {
    data: allRelationships,
    isLoading: isRelationshipsLoading,
    refetch: refetchRelationships,
  } = usePatientDoctors();

  // Query doctors with actual consultation records
  const {
    data: consultedDoctors,
    isLoading: isConsultedLoading,
    refetch: refetchConsulted,
  } = usePreviouslyConsultedDoctors();

  // Modal State
  const [disconnectTarget, setDisconnectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [reconnectTarget, setReconnectTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const activeDoctors = (allRelationships || []).filter((r) => r.status === 'ACTIVE');
  const previouslyConnectedDoctors = (allRelationships || []).filter(
    (r) => r.status === 'INACTIVE',
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="h-6 w-6 text-teal-700" />
            My Doctors & Care Network
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active care team, historical connections, and past consultation records.
          </p>
        </div>

        <div>
          <Link href="/app/doctors">
            <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
              Find New Doctor
            </Button>
          </Link>
        </div>
      </div>

      {/* Navigation Tabs: Explicit Distinction */}
      <div className="flex border-b border-slate-200 gap-6 text-sm">
        <button
          type="button"
          onClick={() => setActiveTab('ACTIVE')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'ACTIVE'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Active Doctors</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 text-teal-800">
            {activeDoctors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PREVIOUS')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'PREVIOUS'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Previously Connected</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {previouslyConnectedDoctors.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('CONSULTED')}
          className={`pb-3 font-semibold transition-colors flex items-center gap-2 border-b-2 -mb-px ${
            activeTab === 'CONSULTED'
              ? 'border-teal-700 text-teal-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Previously Consulted</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {consultedDoctors?.length || 0}
          </span>
        </button>
      </div>

      {/* TAB 1: Active Doctors */}
      {activeTab === 'ACTIVE' && (
        <div className="space-y-4">
          {isRelationshipsLoading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading active care connections..." />
            </div>
          ) : activeDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDoctors.map((rel) => {
                const doc = rel.doctor;
                return (
                  <Card key={rel.id} className="border-slate-200 hover:border-slate-300 transition-colors">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {doc.fullName}
                              </h3>
                              <Badge variant="brand" size="sm">
                                Verified
                              </Badge>
                            </div>
                            <p className="text-xs font-medium text-teal-900 mt-0.5">
                              {doc.specialization || 'Clinical Specialist'}
                              {doc.subSpecialty && ` • ${doc.subSpecialty}`}
                            </p>
                          </div>
                          <Badge variant="success" size="sm" dot>
                            Active
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          {doc.clinicName && (
                            <div className="flex items-center gap-2">
                              <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{doc.clinicName}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-slate-500">
                            <Activity className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>Connected on {formatDate(rel.connectedAt)}</span>
                          </div>

                          {rel.lastConsultationAt && (
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                              <Calendar className="h-3.5 w-3.5 text-teal-700 shrink-0" />
                              <span>
                                Last consultation: {formatDate(rel.lastConsultationAt)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-300 text-slate-600 hover:text-slate-900 text-xs"
                          onClick={() =>
                            setDisconnectTarget({ id: rel.doctorId, name: doc.fullName })
                          }
                        >
                          End Relationship
                        </Button>

                        <div className="flex items-center gap-2">
                          <Link href={`/app/doctors/${rel.doctorId}/relationship`}>
                            <Button variant="outline" size="sm" className="text-xs">
                              Relationship
                            </Button>
                          </Link>
                          <Link href={`/app/doctors/${rel.doctorId}`}>
                            <Button
                              variant="primary"
                              size="sm"
                              className="text-xs"
                              rightIcon={<ArrowRight className="h-3 w-3" />}
                            >
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<Stethoscope className="h-8 w-8 text-slate-400" />}
              title="No active doctor connections"
              description="You have not connected with any physicians yet. Search verified doctors to establish a connection."
              action={
                <Link href="/app/doctors">
                  <Button variant="primary" size="sm">
                    Discover Doctors
                  </Button>
                </Link>
              }
            />
          )}
        </div>
      )}

      {/* TAB 2: Previously Connected Doctors */}
      {activeTab === 'PREVIOUS' && (
        <div className="space-y-4">
          {isRelationshipsLoading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading historical relationships..." />
            </div>
          ) : previouslyConnectedDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previouslyConnectedDoctors.map((rel) => {
                const doc = rel.doctor;
                return (
                  <Card key={rel.id} className="border-slate-200 bg-slate-50/50">
                    <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-slate-900">
                                {doc.fullName}
                              </h3>
                              <Badge variant="brand" size="sm">
                                Verified
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {doc.specialization}
                            </p>
                          </div>
                          <Badge variant="neutral" size="sm" dot>
                            Previously connected
                          </Badge>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          {rel.disconnectedAt && (
                            <p className="text-slate-400 text-[11px]">
                              Ended on {formatDate(rel.disconnectedAt)}
                            </p>
                          )}
                          {rel.lastConsultationAt && (
                            <p className="text-slate-700 font-medium">
                              Last consultation: {formatDate(rel.lastConsultationAt)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() =>
                            setReconnectTarget({ id: rel.doctorId, name: doc.fullName })
                          }
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        >
                          Reconnect
                        </Button>

                        <div className="flex items-center gap-2">
                          <Link href={`/app/doctors/${rel.doctorId}/relationship`}>
                            <Button variant="outline" size="sm">
                              View History
                            </Button>
                          </Link>
                          <Link href={`/app/doctors/${rel.doctorId}`}>
                            <Button variant="outline" size="sm">
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<History className="h-8 w-8 text-slate-400" />}
              title="No previous doctor relationships"
              description="Historical relationships will be recorded here when connections conclude."
            />
          )}
        </div>
      )}

      {/* TAB 3: Previously Consulted Doctors */}
      {activeTab === 'CONSULTED' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 text-xs text-teal-900">
            <h4 className="font-bold text-teal-950 mb-0.5">
              Clinical Consultation Records
            </h4>
            <p className="leading-relaxed">
              These are physicians with whom you have actual clinical consultations on record. Consultation history is permanently preserved regardless of current relationship status.
            </p>
          </div>

          {isConsultedLoading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading consultation history..." />
            </div>
          ) : consultedDoctors && consultedDoctors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultedDoctors.map((doc) => (
                <Card key={doc.doctorId} className="border-slate-200">
                  <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {doc.doctorName}
                            </h3>
                            <Badge variant="brand" size="sm">
                              Verified
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {doc.specialization}
                          </p>
                        </div>

                        {doc.isConnected ? (
                          <Badge variant="success" size="sm" dot>
                            Connected
                          </Badge>
                        ) : doc.relationshipStatus === 'INACTIVE' ? (
                          <Badge variant="neutral" size="sm" dot>
                            Previously Connected
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Not Connected
                          </Badge>
                        )}
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p className="font-semibold text-slate-800">
                          {doc.consultationCount} consultation
                          {doc.consultationCount === 1 ? '' : 's'} conducted
                        </p>
                        <p className="text-slate-500">
                          Latest consultation: {formatDate(doc.lastConsultationAt)}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          First consultation: {formatDate(doc.firstConsultationAt)}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {!doc.isConnected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setReconnectTarget({ id: doc.doctorId, name: doc.doctorName })
                          }
                          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                        >
                          Reconnect
                        </Button>
                      )}

                      <Link href={`/app/doctors/${doc.doctorId}`}>
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          View Profile
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="h-8 w-8 text-slate-400" />}
              title="No clinical consultations on record"
              description="Doctors you consult with on CarePath will appear here."
            />
          )}
        </div>
      )}

      {/* Disconnect Modal */}
      {disconnectTarget && (
        <DisconnectDoctorModal
          isOpen={!!disconnectTarget}
          onClose={() => setDisconnectTarget(null)}
          doctorId={disconnectTarget.id}
          doctorName={disconnectTarget.name}
          onSuccess={() => {
            refetchRelationships();
            refetchConsulted();
          }}
        />
      )}

      {/* Reconnect Modal */}
      {reconnectTarget && (
        <ReconnectDoctorModal
          isOpen={!!reconnectTarget}
          onClose={() => setReconnectTarget(null)}
          doctorId={reconnectTarget.id}
          doctorName={reconnectTarget.name}
          onSuccess={() => {
            refetchRelationships();
            refetchConsulted();
          }}
        />
      )}
    </div>
  );
}
