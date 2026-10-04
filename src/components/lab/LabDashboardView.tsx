'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { labApi } from '@/lib/api/lab';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingCard } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  FlaskConical,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  Microscope,
} from 'lucide-react';

export function LabDashboardView() {
  // 1. Fetch current user's lab organization profile & verification status
  const {
    data: labData,
    isLoading: labLoading,
    error: labError,
  } = useQuery({
    queryKey: ['my-lab-profile'],
    queryFn: () => labApi.getMyLab(),
  });

  const lab = labData?.lab;
  const isVerified = lab?.verificationStatus === 'VERIFIED';
  const isPending = lab?.verificationStatus === 'PENDING';
  const isRejected = lab?.verificationStatus === 'REJECTED';
  const isSuspended = lab?.verificationStatus === 'SUSPENDED';

  // 2. Fetch recent orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['lab-orders', lab?.id],
    queryFn: () => labApi.listOrders({ limit: 10 }),
    enabled: !!lab,
  });

  const orders = ordersData?.orders || [];

  // Derive real operational counts from real orders
  const newOrdersCount = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'ACCEPTED',
  ).length;
  const samplePendingCount = orders.filter((o) => o.status === 'SAMPLE_PENDING').length;
  const processingCount = orders.filter(
    (o) => o.status === 'PROCESSING' || o.status === 'SAMPLE_COLLECTED',
  ).length;
  const reportsReviewCount = orders.filter(
    (o) => o.status === 'REPORT_PENDING_REVIEW',
  ).length;

  if (labLoading) {
    return (
      <div className="space-y-6">
        <LoadingCard />
      </div>
    );
  }

  if (labError) {
    return (
      <div className="space-y-6">
        <ErrorMessage
          title="Laboratory Profile Unavailable"
          message="Could not load your laboratory association. Please ensure your account is registered with a laboratory."
        />
        <div className="flex justify-center">
          <Link href="/app/lab/profile">
            <Button>Register Laboratory Facility</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* 1. Verification Operational Banners */}
      {isPending && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-amber-900">
                Laboratory Verification Pending
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your laboratory verification is currently under review by platform administrators. Some laboratory operations will remain restricted until verification is completed.
              </p>
              <div className="mt-2">
                <Link
                  href="/app/lab/profile"
                  className="text-xs font-semibold text-amber-900 hover:text-amber-950 underline"
                >
                  View Facility Profile & Licensing Details &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-rose-900">
                Verification Request Not Approved
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                {lab?.verificationNotes || 'Your laboratory verification request was not approved. Please review registration details and licensing documentation.'}
              </p>
              <div className="mt-2">
                <Link
                  href="/app/lab/profile"
                  className="text-xs font-semibold text-rose-900 hover:text-rose-950 underline"
                >
                  Update Information and Resubmit &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="bg-slate-100 border-l-4 border-slate-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-slate-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-slate-900">
                Laboratory Access Suspended
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Diagnostic processing access is temporarily suspended. Please contact platform administration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {lab?.name || 'Diagnostic Laboratory'}
            </h1>
            <Badge
              variant={
                isVerified
                  ? 'success'
                  : isPending
                  ? 'warning'
                  : 'error'
              }
            >
              {lab?.verificationStatus || 'PENDING'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            License: {lab?.licenseNumber} • Operating in {lab?.city || 'Registered Center'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/app/lab/orders">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ClipboardList className="h-4 w-4" />
              <span>All Orders</span>
            </Button>
          </Link>
          <Link href="/app/lab/tests">
            <Button variant="primary" size="sm" className="gap-1.5">
              <FlaskConical className="h-4 w-4" />
              <span>Test Catalog</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Operational Focus Summary Cards (Real metrics only) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">New Orders</span>
            <ClipboardList className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{newOrdersCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Pending acceptance</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Pending Samples</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{samplePendingCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting collection</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">In Processing</span>
            <Microscope className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{processingCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Under analysis</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Review Queue</span>
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{reportsReviewCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">Ready for verification</p>
        </div>
      </div>

      {/* 3. Orders Requiring Attention Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-3 border-b border-slate-200">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900">
              Orders Requiring Attention
            </CardTitle>
            <p className="text-xs text-slate-500">
              Active diagnostic orders routed to your facility
            </p>
          </div>
          <Link href="/app/lab/orders" className="text-xs font-semibold text-teal-800 hover:text-teal-900">
            View full order queue &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading orders...</div>
          ) : ordersError ? (
            <div className="p-4 text-xs text-rose-600">Failed to load laboratory orders.</div>
          ) : orders.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<ClipboardList className="h-6 w-6 text-slate-400" />}
                title="No laboratory orders require attention"
                description="New diagnostic requests from patients and clinicians will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">Order Number</th>
                    <th className="py-2.5 px-4">Patient</th>
                    <th className="py-2.5 px-4">Tests</th>
                    <th className="py-2.5 px-4">Collection</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Ordered Date</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {order.patientName || order.patient?.patientProfile?.fullName || 'Patient'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600">
                        {order.items?.map((i) => i.testName).join(', ') || 'Diagnostic Panel'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {order.collectionMode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            order.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : order.status === 'PROCESSING'
                              ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                              : order.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/app/lab/orders/${order.id}`}>
                          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1">
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
