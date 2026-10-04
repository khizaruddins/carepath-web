'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, FollowUpStatus } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  XCircle,
  Plus,
} from 'lucide-react';

export default function DoctorFollowUpsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('UPCOMING');

  const { data: followUps, isLoading, refetch } = useQuery({
    queryKey: ['doctor-all-follow-ups'],
    queryFn: () => doctorApi.getDoctorFollowUps(),
    enabled: !!user,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FollowUpStatus }) =>
      doctorApi.updateFollowUpStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-all-follow-ups'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-dashboard-workflow'] });
    },
  });

  const filteredFollowUps = (followUps || []).filter((fu) => {
    if (filter === 'UPCOMING') return fu.status === 'UPCOMING';
    if (filter === 'COMPLETED') return fu.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-teal-700" />
            Patient Follow-up Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track scheduled review encounters, monitor treatment plans, and update completion status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/patients">
            <Button variant="outline" size="sm">
              Schedule via Patient Vault
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        {[
          { label: 'Upcoming / Due', value: 'UPCOMING' },
          { label: 'Completed Encounters', value: 'COMPLETED' },
          { label: 'All Follow-ups', value: 'ALL' },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors select-none ${
              filter === tab.value
                ? 'bg-teal-700 text-white font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Retrieving scheduled follow-up encounters..." />
        </div>
      ) : filteredFollowUps.length > 0 ? (
        <div className="space-y-3">
          {filteredFollowUps.map((fu) => {
            const isDueToday =
              new Date(fu.dueDate).toDateString() === new Date().toDateString();
            const isOverdue =
              fu.status === 'UPCOMING' &&
              new Date(fu.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

            return (
              <Card key={fu.id} className="hover:border-teal-700/40 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {fu.patient?.patientProfile?.fullName || fu.patient?.email || 'Patient'}
                      </span>
                      <Badge
                        variant={
                          fu.status === 'COMPLETED'
                            ? 'success'
                            : isOverdue
                            ? 'error'
                            : isDueToday
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {isOverdue ? 'Overdue' : isDueToday ? 'Due Today' : fu.status}
                      </Badge>
                    </div>

                    <p className="text-slate-700 font-medium">
                      Clinical Reason: {fu.reason}
                    </p>

                    {fu.instructions && (
                      <p className="text-[11px] text-slate-500">
                        Instructions: {fu.instructions}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-400">
                      Scheduled Due Date: <strong>{formatDate(fu.dueDate)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/app/patients/${fu.patientId}`}>
                      <Button size="sm" variant="ghost" className="text-teal-800">
                        Workspace
                      </Button>
                    </Link>

                    {fu.status === 'UPCOMING' && (
                      <>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: fu.id,
                              status: 'COMPLETED',
                            })
                          }
                          leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                        >
                          Mark Completed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: fu.id,
                              status: 'CANCELLED',
                            })
                          }
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No follow-ups in this view"
          description="Schedule follow-up appointments from any patient workspace to track recovery and review investigation results."
          icon={<CalendarCheck className="h-6 w-6 text-slate-400" />}
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
