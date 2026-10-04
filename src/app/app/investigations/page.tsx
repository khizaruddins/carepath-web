'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePatientInvestigations } from '@/lib/hooks/use-lab-marketplace';
import { InvestigationRequest } from '@/lib/api/doctor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate, formatDateTime } from '@/lib/utils';
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  ArrowRight,
  Filter,
  Search,
  Building2,
  Calendar,
  Lock,
} from 'lucide-react';

type FilterTab = 'ALL' | 'ACTION_NEEDED' | 'IN_PROGRESS' | 'COMPLETED';

export default function PatientInvestigationsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: investigations, isLoading, refetch } = usePatientInvestigations();

  const getFilteredInvestigations = () => {
    if (!investigations) return [];
    return investigations.filter((inv) => {
      // Search filter
      const matchesSearch =
        !searchQuery.trim() ||
        (inv.testName || inv.investigationName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.doctor?.user?.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Status tab filter
      if (activeTab === 'ACTION_NEEDED') {
        return inv.status === 'REQUESTED';
      }
      if (activeTab === 'IN_PROGRESS') {
        return ['ORDERED', 'SAMPLE_COLLECTED', 'IN_PROGRESS'].includes(inv.status);
      }
      if (activeTab === 'COMPLETED') {
        return inv.status === 'COMPLETED';
      }
      return true;
    });
  };

  const filtered = getFilteredInvestigations();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return (
          <Badge variant="warning" size="sm" dot>
            Action Needed: Choose Lab
          </Badge>
        );
      case 'ORDERED':
        return (
          <Badge variant="brand" size="sm" dot>
            Lab Order Placed
          </Badge>
        );
      case 'SAMPLE_COLLECTED':
        return (
          <Badge variant="brand" size="sm" dot>
            Sample Collected
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="brand" size="sm" dot>
            Processing at Lab
          </Badge>
        );
      case 'COMPLETED':
        return (
          <Badge variant="success" size="sm" dot>
            Report Ready
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <FlaskConical className="h-6 w-6 text-teal-700" />
              Medical Investigations &amp; Diagnostic Orders
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Diagnostic tests ordered by your physicians. Compare accredited labs nearby, book sample collection, and securely track clinical results.
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Investigations
            </button>
            <button
              onClick={() => setActiveTab('ACTION_NEEDED')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'ACTION_NEEDED'
                  ? 'bg-white text-teal-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Choose Lab ({investigations?.filter((i) => i.status === 'REQUESTED').length || 0})
            </button>
            <button
              onClick={() => setActiveTab('IN_PROGRESS')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'IN_PROGRESS'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('COMPLETED')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'COMPLETED'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests or doctors..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Investigations List */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Loading your medical investigations..." />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((inv) => {
            const isRequested = inv.status === 'REQUESTED';
            const isCompleted = inv.status === 'COMPLETED';

            return (
              <Card
                key={inv.id}
                className="hover:border-teal-700/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="py-3 px-4 border-b border-slate-100 flex flex-row items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-bold text-slate-900">
                        {inv.testName || inv.investigationName || 'Diagnostic Test'}
                      </CardTitle>
                      {inv.priority && inv.priority !== 'ROUTINE' && (
                        <Badge
                          variant={inv.priority === 'STAT' ? 'error' : 'warning'}
                          size="sm"
                        >
                          {inv.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <Stethoscope className="h-3 w-3 text-teal-700" />
                      Prescribed by Dr.{' '}
                      {inv.doctor?.user?.profile?.fullName || 'Physician'} •{' '}
                      {formatDate(inv.createdAt)}
                    </p>
                  </div>
                  {getStatusBadge(inv.status)}
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Clinical Indication */}
                    {inv.clinicalReason && (
                      <p className="text-slate-700 bg-slate-50 p-2.5 rounded-md border border-slate-100 text-[11px]">
                        <strong>Clinical Reason:</strong> {inv.clinicalReason}
                      </p>
                    )}

                    {/* Instructions */}
                    {inv.instructions && (
                      <p className="text-slate-600 text-[11px]">
                        <span className="font-semibold text-slate-700">Prep:</span>{' '}
                        {inv.instructions}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <Link href={`/app/investigations/${inv.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>

                    {isRequested ? (
                      <Link href={`/app/investigations/${inv.id}/labs`}>
                        <Button
                          variant="primary"
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          Find &amp; Compare Labs
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/app/investigations/${inv.id}`}>
                        <Button
                          variant={isCompleted ? 'secondary' : 'outline'}
                          size="sm"
                          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                        >
                          {isCompleted ? 'View Final Report' : 'Track Order'}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No investigations found"
          description={
            searchQuery
              ? 'No tests matched your search query.'
              : activeTab === 'ACTION_NEEDED'
              ? 'No pending test requests require lab selection.'
              : 'You do not have any diagnostic investigation requests at this time. Tests ordered by your doctors during consultations will appear here.'
          }
          icon={<FlaskConical className="h-8 w-8 text-teal-700" />}
          action={
            activeTab !== 'ALL' || searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveTab('ALL');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
