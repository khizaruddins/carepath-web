'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { labApi } from '@/lib/api/lab';
import { LabOrder, LabOrderStatus, LabCollectionMode } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Filter,
  Home,
  Building,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

const ORDER_STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending Acceptance', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Sample Pending', value: 'SAMPLE_PENDING' },
  { label: 'Sample Collected', value: 'SAMPLE_COLLECTED' },
  { label: 'Processing Analysis', value: 'PROCESSING' },
  { label: 'Report Pending Review', value: 'REPORT_PENDING_REVIEW' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function LabOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [collectionFilter, setCollectionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch current lab profile
  const { data: labData, isLoading: labLoading } = useQuery({
    queryKey: ['my-lab-profile'],
    queryFn: () => labApi.getMyLab(),
  });

  const lab = labData?.lab;

  // 2. Fetch lab orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    error: ordersError,
    refetch,
  } = useQuery({
    queryKey: ['lab-orders', lab?.id, statusFilter],
    queryFn: () =>
      labApi.listOrders({
        status: statusFilter !== 'ALL' ? (statusFilter as LabOrderStatus) : undefined,
        limit: 50,
      }),
    enabled: !!lab?.id,
  });

  const orders = ordersData?.orders || [];

  const filteredOrders = orders.filter((order) => {
    const matchesCollection =
      collectionFilter === 'ALL' || order.collectionMode === collectionFilter;
    const matchesSearch =
      !searchQuery ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.patient?.patientProfile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((i) => i.testName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCollection && matchesSearch;
  });

  if (labLoading) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-teal-700" />
            <span>Diagnostic Orders Queue</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational queue of incoming and processing diagnostic test requests
          </p>
        </div>

        <div className="text-xs text-slate-500">
          Total in Queue: <strong className="text-slate-800">{filteredOrders.length}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order #, patient name, or test..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-slate-300 bg-white placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              {ORDER_STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={collectionFilter}
            onChange={(e) => setCollectionFilter(e.target.value)}
            className="text-xs rounded-md border border-slate-300 px-2.5 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-700"
          >
            <option value="ALL">All Collection Modes</option>
            <option value="LAB">At Lab Facility</option>
            <option value="HOME">Home Collection</option>
          </select>
        </div>
      </div>

      {/* Orders Table & Mobile Cards */}
      <Card>
        <CardContent className="p-0">
          {ordersLoading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading diagnostic orders...</div>
          ) : ordersError ? (
            <div className="p-6 text-xs text-rose-600">Failed to load laboratory orders queue.</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={<ClipboardList className="h-6 w-6 text-slate-400" />}
                title="No orders found"
                description={
                  searchQuery || statusFilter !== 'ALL' || collectionFilter !== 'ALL'
                    ? 'No orders match your active filter criteria.'
                    : 'No diagnostic orders have been routed to your facility yet.'
                }
              />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Order Number</th>
                      <th className="py-2.5 px-4">Patient</th>
                      <th className="py-2.5 px-4">Doctor</th>
                      <th className="py-2.5 px-4">Tests</th>
                      <th className="py-2.5 px-4">Collection</th>
                      <th className="py-2.5 px-4">Priority</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4">Ordered Date</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 font-mono font-medium text-slate-900">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {order.patientName || order.patient?.patientProfile?.fullName || 'Patient'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {order.prescribedDoctor?.doctorProfile?.fullName
                            ? `Dr. ${order.prescribedDoctor.doctorProfile.fullName}`
                            : 'Direct / Self'}
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                          {order.items?.map((i) => i.testName).join(', ') || 'Diagnostic Panel'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                            {order.collectionMode === 'HOME' ? (
                              <Home className="h-3 w-3 text-sky-600" />
                            ) : (
                              <Building className="h-3 w-3 text-slate-600" />
                            )}
                            {order.collectionMode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              order.priority === 'STAT'
                                ? 'bg-rose-100 text-rose-800'
                                : order.priority === 'URGENT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {order.priority}
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
                                : order.status === 'CANCELLED'
                                ? 'bg-rose-50 text-rose-800 border-rose-200'
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
                            <Button variant="ghost" size="sm" className="h-7 text-xs px-2.5 gap-1 text-teal-800 hover:text-teal-950 font-semibold">
                              <span>Manage</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-900 font-medium">
                      {order.patientName || order.patient?.patientProfile?.fullName || 'Patient'}
                    </div>

                    <div className="text-[11px] text-slate-500">
                      {order.items?.map((i) => i.testName).join(', ')}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>{formatDate(order.createdAt)}</span>
                      <Link href={`/app/lab/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                          View Order
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
