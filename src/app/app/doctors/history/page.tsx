'use client';

import React from 'react';
import Link from 'next/link';
import {
  useDoctorSearchHistory,
  useClearSearchHistory,
} from '@/lib/hooks/use-doctor-discovery';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate } from '@/lib/utils';
import {
  History,
  Trash2,
  Search,
  ArrowLeft,
  Stethoscope,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export default function DoctorSearchHistoryPage() {
  const { data: historyItems, isLoading, refetch } = useDoctorSearchHistory();
  const clearMutation = useClearSearchHistory();

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <History className="h-6 w-6 text-teal-700" />
            Doctor Search & Profile History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Recent doctor searches and profile views associated with your session.
          </p>
        </div>

        {historyItems && historyItems.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            isLoading={clearMutation.isPending}
            onClick={() => clearMutation.mutate()}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-slate-500" />}
            className="text-xs"
          >
            Clear All History
          </Button>
        )}
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex items-start gap-3">
        <Lock className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs text-slate-600">
          <span className="font-bold text-slate-800">
            Private & Non-Clinical
          </span>
          <p className="text-[11px] leading-relaxed">
            Search history is private to your patient portal. It does not appear in your clinical health records and is never exposed to physicians or healthcare providers.
          </p>
        </div>
      </div>

      {/* History Items List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16">
              <LoadingSpinner message="Loading search history..." />
            </div>
          ) : historyItems && historyItems.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 shrink-0 mt-0.5">
                      {item.doctorId ? (
                        <Stethoscope className="h-4 w-4" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </div>

                    <div className="space-y-0.5 text-xs">
                      {item.doctorId && item.doctor?.doctorProfile ? (
                        <Link
                          href={`/app/doctors/${item.doctorId}`}
                          className="font-bold text-slate-900 hover:text-teal-800 transition-colors inline-flex items-center gap-1"
                        >
                          {item.doctor.doctorProfile.fullName}
                          <ExternalLink className="h-3 w-3 text-slate-400" />
                        </Link>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          {item.searchQuery || 'Doctor search'}
                        </span>
                      )}

                      <span className="text-[11px] text-slate-400 block">
                        Searched {formatDate(item.searchedAt)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => clearMutation.mutate(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Remove from history"
                    aria-label="Remove from history"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Search className="h-8 w-8 text-slate-400" />}
              title="No recent doctor searches"
              description="Your doctor queries and viewed profiles will be listed here for quick access."
              action={
                <Link href="/app/doctors">
                  <Button variant="primary" size="sm">
                    Find Doctors
                  </Button>
                </Link>
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
