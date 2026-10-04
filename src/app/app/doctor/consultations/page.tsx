'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  CalendarCheck,
  ArrowRight,
  User,
  Plus,
} from 'lucide-react';

export default function DoctorConsultationsPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  // Fetch all assigned patients to access consultations, or fetch dashboard
  const { data: patients, isLoading } = useQuery({
    queryKey: ['doctor-assigned-patients'],
    queryFn: () => doctorApi.getDoctorAssignedPatients(),
    enabled: !!user,
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-6 w-6 text-teal-700" />
            Clinical Consultations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive history of clinical notes, examination findings, and management plans across your patient cohort.
          </p>
        </div>
        <Link href="/app/patients">
          <Button variant="primary" size="sm" leftIcon={<Plus className="h-3.5 w-3.5" />}>
            New Consultation from Patient Vault
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading patient consultation logs..." />
        </div>
      ) : patients && patients.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((item) => (
              <Card key={item.accessId} className="hover:border-teal-700/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900">
                      {item.patient.fullName || item.patient.email}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.relationshipType?.replace('_', ' ') || 'Primary Physician'} • {item.patient.city || 'India'}
                    </p>
                  </div>
                  <Link href={`/app/patients/${item.patientId}?tab=consultations`}>
                    <Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3 w-3" />}>
                      Consults
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="p-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Last Consultation:</span>
                    <span className="font-medium text-slate-800">
                      {item.clinicalSnapshot?.lastConsultationDate
                        ? formatDate(item.clinicalSnapshot.lastConsultationDate)
                        : 'No consultation recorded yet'}
                    </span>
                  </div>
                  {item.clinicalSnapshot?.lastConsultationReason && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Indication:</span>
                      <span className="font-semibold text-teal-900">
                        {item.clinicalSnapshot.lastConsultationReason}
                      </span>
                    </div>
                  )}
                  {item.clinicalSnapshot?.nextFollowUpDate && (
                    <div className="flex justify-between text-emerald-700 font-medium pt-1 border-t border-slate-100">
                      <span>Scheduled Follow-up:</span>
                      <span>{formatDate(item.clinicalSnapshot.nextFollowUpDate)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No patient consultations yet"
          description="Connect with patients to record clinical examination notes and treatment plans."
          icon={<ClipboardList className="h-6 w-6 text-slate-400" />}
          action={
            <Link href="/app/patients">
              <Button variant="outline" size="sm">
                View Connected Patients
              </Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
