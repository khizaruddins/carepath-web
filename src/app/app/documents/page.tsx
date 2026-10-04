'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api/documents';
import { DocumentCategory, DocumentProcessingStatus, MedicalDocument } from '@/lib/api/types';
import { formatDate, formatCategory, formatFileSize } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingTableRows, LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { useAuth } from '@/lib/auth-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog } from '@/components/ui/Dialog';
import {
  FolderLock,
  Search,
  Upload,
  FileText,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Users,
  RotateCcw,
  Archive,
  Trash2,
} from 'lucide-react';

export default function DocumentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'active' | 'trash'>('active');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Restore request modal
  const [restoreModalDoc, setRestoreModalDoc] = useState<MedicalDocument | null>(null);
  const [restoreReason, setRestoreReason] = useState<string>('Accidentally archived this record. Please restore to my active health vault.');
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const isDoctor = user?.role === 'DOCTOR';

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['documents-list', search, selectedCategory, selectedStatus],
    queryFn: () =>
      documentsApi.getDocuments({
        category: (selectedCategory as DocumentCategory) || undefined,
        status: (selectedStatus as DocumentProcessingStatus) || undefined,
        search: search.trim() || undefined,
        limit: 50,
      }),
    enabled: activeTab === 'active',
  });

  const {
    data: archivedDocs,
    isLoading: archivedLoading,
    error: archivedError,
    refetch: refetchArchived,
  } = useQuery({
    queryKey: ['archived-documents'],
    queryFn: () => documentsApi.getArchivedDocuments(),
    enabled: activeTab === 'trash' && !isDoctor,
  });

  const restoreRequestMutation = useMutation({
    mutationFn: () => {
      if (!restoreModalDoc) throw new Error('No document selected');
      return documentsApi.requestDocumentRestore(restoreModalDoc.id, restoreReason);
    },
    onSuccess: (res) => {
      setRestoreSuccess(res.message);
      setRestoreModalDoc(null);
      queryClient.invalidateQueries({ queryKey: ['archived-documents'] });
      setTimeout(() => setRestoreSuccess(null), 5000);
    },
    onError: (err: any) => {
      setRestoreError(err.message || 'Failed to submit restore request');
    },
  });

  const cancelRestoreMutation = useMutation({
    mutationFn: (documentId: string) => documentsApi.cancelDocumentRestore(documentId),
    onSuccess: (res) => {
      setRestoreSuccess(res.message);
      queryClient.invalidateQueries({ queryKey: ['archived-documents'] });
      setTimeout(() => setRestoreSuccess(null), 5000);
    },
    onError: (err: any) => {
      setRestoreError(err.message || 'Failed to cancel restoration request');
    },
  });

  const documents = data?.documents || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Health Records Vault</h1>
            <Badge variant="neutral" size="sm">
              {data?.total ?? 0} {data?.total === 1 ? 'Record' : 'Records'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private, encrypted repository for all diagnostic reports, prescriptions, and clinical notes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {isDoctor ? (
            <Link href="/app/doctor/patients">
              <Button variant="primary" size="sm" leftIcon={<Users className="h-3.5 w-3.5" />}>
                View Consented Patients
              </Button>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setUploadModalOpen(true)}
              leftIcon={<Upload className="h-3.5 w-3.5" />}
            >
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {restoreSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{restoreSuccess}</span>
        </div>
      )}

      {/* Tab Switcher for Patients */}
      {!isDoctor && (
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'active'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderLock className="h-3.5 w-3.5" />
            <span>Active Vault</span>
          </button>
          <button
            onClick={() => setActiveTab('trash')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all ${
              activeTab === 'trash'
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Archived / Trash</span>
            {archivedDocs && archivedDocs.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold">
                {archivedDocs.length}
              </span>
            )}
          </button>
        </div>
      )}

      {activeTab === 'trash' ? (
        /* Archived / Trash Section */
        <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Archive className="h-4 w-4 text-slate-600" />
              <span>Archived Medical Records (Soft-Deleted)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              These records are hidden from active views. If you accidentally archived a document, you can request an administrator to restore it to your active health vault.
            </p>
          </div>

          {archivedLoading ? (
            <div className="p-8 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          ) : !archivedDocs || archivedDocs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Trash2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">Trash is empty</p>
              <p className="mt-1">You have no soft-deleted documents in your archive.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {archivedDocs.map((doc) => {
                const version = doc.versions?.[0];
                return (
                  <div
                    key={doc.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {doc.metadata?.reportTitle || formatCategory(doc.category)}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {formatCategory(doc.category)}
                        </Badge>
                      </div>
                      <p className="text-slate-500 text-[11px]">
                        {version?.originalFileName} • Archived {formatDate(doc.updatedAt)}
                      </p>
                      {doc.restoreReason && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200/60 inline-block mt-1">
                          Restore note: {doc.restoreReason}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {doc.restoreRequested || doc.restoreStatus === 'PENDING' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="warning" size="sm" dot>
                            Under Admin Review
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-slate-700"
                            isLoading={cancelRestoreMutation.isPending}
                            onClick={() => cancelRestoreMutation.mutate(doc.id)}
                          >
                            Cancel Request
                          </Button>
                        </div>
                      ) : doc.restoreStatus === 'REJECTED' ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="error" size="sm" dot>
                            Declined by Admin
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            leftIcon={<RotateCcw className="h-3.5 w-3.5 text-teal-700" />}
                            onClick={() => {
                              setRestoreModalDoc(doc);
                              setRestoreReason('Requesting reconsideration for document restoration with additional context.');
                              setRestoreError(null);
                            }}
                          >
                            Re-request
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<RotateCcw className="h-3.5 w-3.5 text-teal-700" />}
                          onClick={() => {
                            setRestoreModalDoc(doc);
                            setRestoreReason('Accidentally archived this record. Please restore to my active health vault.');
                            setRestoreError(null);
                          }}
                        >
                          Request Admin to Restore
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by title, provider, facility..."
            leftIcon={<Search className="h-4 w-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { label: 'All Document Categories', value: '' },
              { label: 'Lab Report', value: 'LAB_REPORT' },
              { label: 'Prescription', value: 'PRESCRIPTION' },
              { label: 'Consultation Note', value: 'CONSULTATION' },
              { label: 'Discharge Summary', value: 'DISCHARGE_SUMMARY' },
              { label: 'Imaging Report', value: 'IMAGING_REPORT' },
              { label: 'X-Ray Scan', value: 'XRAY' },
              { label: 'CT Scan', value: 'CT' },
              { label: 'MRI Scan', value: 'MRI' },
              { label: 'Other Record', value: 'OTHER' },
            ]}
          />
        </div>

        {/* Clear Filters Button */}
        {(search || selectedCategory || selectedStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setSelectedStatus('');
            }}
          >
            Reset
          </Button>
        )}
      </div>

      {/* Error View */}
      {error && (
        <ErrorMessage
          title="Could not load medical documents"
          message={(error as any)?.message || 'An error occurred while fetching records.'}
          onRetry={() => refetch()}
        />
      )}

      {/* Records Table / List */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Document / Title</div>
          <div className="col-span-3">Provider & Facility</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2 text-right">Verification</div>
        </div>

        {/* Loading State */}
        {isLoading && <LoadingTableRows count={6} />}

        {/* Empty State */}
        {!isLoading && documents.length === 0 && (
          <div className="p-8">
            <EmptyState
              icon={<FolderLock className="h-6 w-6 text-slate-400" />}
              title={
                search || selectedCategory
                  ? 'No Documents Matched Filters'
                  : 'Your Health Vault is Empty'
              }
              description={
                search || selectedCategory
                  ? 'Try modifying your search query or clearing the category filter.'
                  : 'Start maintaining your health vault by uploading lab reports, prescriptions, or imaging scans.'
              }
              actionLabel={
                search || selectedCategory ? 'Clear All Filters' : 'Upload Medical Document'
              }
              onAction={() => {
                if (search || selectedCategory) {
                  setSearch('');
                  setSelectedCategory('');
                } else {
                  setUploadModalOpen(true);
                }
              }}
            />
          </div>
        )}

        {/* Document Rows */}
        {!isLoading && documents.length > 0 && (
          <div className="divide-y divide-slate-100">
            {documents.map((doc: MedicalDocument) => {
              const title = doc.metadata?.reportTitle || formatCategory(doc.category);
              const provider = doc.metadata?.providerName || '';
              const facility = doc.metadata?.facility || '';
              const docDate = doc.metadata?.documentDate || doc.createdAt;
              const isConfirmed = doc.metadata?.isPatientConfirmed;
              const latestVer = doc.versions?.[0];

              return (
                <div
                  key={doc.id}
                  className="px-4 md:px-5 py-3.5 hover:bg-slate-50/80 transition-colors flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 md:items-center"
                >
                  {/* Col 1: Title & Category */}
                  <div className="md:col-span-5 flex items-start gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/app/documents/${doc.id}`}
                        className="text-xs sm:text-sm font-semibold text-slate-900 hover:text-teal-800 hover:underline truncate block"
                      >
                        {title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="neutral" size="sm">
                          {formatCategory(doc.category)}
                        </Badge>
                        {latestVer && (
                          <span className="text-[10px] text-slate-400">
                            {formatFileSize(latestVer.fileSizeBytes)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Col 2: Provider & Facility */}
                  <div className="md:col-span-3 text-xs text-slate-600 truncate">
                    <p className="font-medium text-slate-800 truncate">
                      {provider || 'Self-Uploaded'}
                    </p>
                    {facility && <p className="text-[11px] text-slate-400 truncate">{facility}</p>}
                  </div>

                  {/* Col 3: Date */}
                  <div className="md:col-span-2 text-xs text-slate-600">
                    <span className="font-medium text-slate-800">{formatDate(docDate)}</span>
                  </div>

                  {/* Col 4: Status & Action Link */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-2.5">
                    {isConfirmed ? (
                      <Badge variant="success" size="sm" dot>
                        Confirmed
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm" dot>
                        Needs Review
                      </Badge>
                    )}
                    <Link
                      href={`/app/documents/${doc.id}`}
                      className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      aria-label={`View details for ${title}`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
        </>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Restore Request Modal */}
      {restoreModalDoc && (
        <Dialog
          isOpen={true}
          onClose={() => setRestoreModalDoc(null)}
          title="Request Document Restoration"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Submit a restoration request to CarePath System Administrators to recover{' '}
              <strong className="text-slate-900">
                {restoreModalDoc.metadata?.reportTitle || formatCategory(restoreModalDoc.category)}
              </strong>
              .
            </p>

            {restoreError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded border border-rose-200">
                {restoreError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-medium text-slate-700">Reason for Restoration</label>
              <textarea
                rows={3}
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="Explain why this document needs restoration (e.g. accidental deletion, required for upcoming consult)..."
                className="w-full p-2.5 rounded border border-slate-200 text-xs focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button variant="ghost" size="sm" onClick={() => setRestoreModalDoc(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={restoreRequestMutation.isPending}
                onClick={() => restoreRequestMutation.mutate()}
              >
                Send Request to Admin
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
