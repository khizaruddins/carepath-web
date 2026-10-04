import React from 'react';
import Link from 'next/link';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingState';
import { ErrorMessage } from '../ui/ErrorMessage';
import { useTimelineEventDetails } from '@/lib/hooks/useTimeline';
import { TimelineEventItem } from '@/lib/api/types';
import { formatDate, formatDateTime, formatCategory } from '@/lib/utils';
import { getTimelineEventMeta } from '@/lib/timeline-utils';
import {
  ExternalLink,
  Calendar,
  User,
  Building,
  FileText,
  Pill,
  Stethoscope,
  Microscope,
  Send,
  CalendarCheck,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface TimelineSourceModalProps {
  event: TimelineEventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TimelineSourceModal({
  event,
  isOpen,
  onClose,
}: TimelineSourceModalProps) {
  const { data, isLoading, error, refetch } = useTimelineEventDetails(
    event ? event.id : null,
  );

  if (!event) return null;

  const meta = getTimelineEventMeta(event.eventType, event.source?.type);
  const Icon = meta.icon;
  const resolved = data?.resolvedSource?.sourceData;
  const sourceType = event.source?.type || 'DOCUMENT';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={event.title}
      description={`Original medical record • ${meta.label}`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-left">
        {/* Loading */}
        {isLoading && (
          <div className="py-8">
            <LoadingSpinner message="Retrieving authorized clinical record..." />
          </div>
        )}

        {/* Error */}
        {error && (
          <ErrorMessage
            title="Could not load record details"
            message={(error as any)?.message || 'Failed to retrieve underlying medical record.'}
            onRetry={() => refetch()}
          />
        )}

        {/* Content */}
        {!isLoading && !error && (
          <div className="space-y-5 text-xs text-slate-700">
            {/* Top metadata strip */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${meta.badgeClass}`}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-600 font-medium">
                  {formatDate(event.eventDate)}
                </span>
              </div>

              {event.providerName && (
                <span className="text-slate-600 font-medium">
                  Provider: {event.providerName}
                </span>
              )}
            </div>

            {/* Source Specific Renderers */}

            {/* 1. DOCUMENT */}
            {sourceType === 'DOCUMENT' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Document Category
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {formatCategory(resolved?.category || event.metadata?.category)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Diagnostic Facility
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {resolved?.metadata?.facility || event.metadata?.facility || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Report Title
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {resolved?.metadata?.reportTitle || event.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Attending Clinician
                    </span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {resolved?.metadata?.providerName || event.providerName || '—'}
                    </p>
                  </div>
                </div>

                {resolved?.metadata?.patientNotes && (
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Patient Notes
                    </span>
                    <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
                      {resolved.metadata.patientNotes}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <Link href={`/app/documents/${event.source?.id}`}>
                    <Button
                      size="sm"
                      rightIcon={<ExternalLink className="h-3.5 w-3.5" />}
                    >
                      Open in Document Vault
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* 2. CONSULTATION */}
            {sourceType === 'CONSULTATION' && (
              <div className="space-y-3.5">
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Reason for Visit
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {resolved?.reasonForVisit || event.title}
                    </p>
                  </div>

                  {resolved?.chiefComplaint && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Chief Complaint
                      </span>
                      <p className="text-slate-700 mt-0.5">{resolved.chiefComplaint}</p>
                    </div>
                  )}

                  {resolved?.assessment && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Clinical Assessment
                      </span>
                      <p className="text-slate-800 font-medium mt-0.5">{resolved.assessment}</p>
                    </div>
                  )}

                  {resolved?.plan && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Treatment Plan
                      </span>
                      <p className="text-slate-700 mt-0.5">{resolved.plan}</p>
                    </div>
                  )}

                  {resolved?.clinicalNotes && (
                    <div>
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Clinical Examination Notes
                      </span>
                      <p className="text-slate-600 mt-0.5 p-2 bg-slate-50 rounded border border-slate-100 whitespace-pre-wrap">
                        {resolved.clinicalNotes}
                      </p>
                    </div>
                  )}

                  {resolved?.followUpInstructions && (
                    <div className="pt-1">
                      <span className="text-[11px] text-slate-400 uppercase font-semibold">
                        Follow-up Instructions
                      </span>
                      <p className="text-teal-900 font-medium mt-0.5">
                        {resolved.followUpInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. PRESCRIPTION */}
            {sourceType === 'PRESCRIPTION' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Medication Schedule
                  </span>
                  <span className="text-slate-400">
                    {resolved?.items?.length || 0} item(s)
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-2.5">Medication</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {(resolved?.items || []).map((item: any, idx: number) => (
                        <tr key={item.id || idx}>
                          <td className="p-2.5 font-bold text-slate-900">
                            {item.medicineName}
                          </td>
                          <td className="p-2.5 text-slate-700">{item.dosage}</td>
                          <td className="p-2.5 text-slate-600">{item.frequency}</td>
                          <td className="p-2.5 text-slate-600">{item.duration}</td>
                          <td className="p-2.5 text-slate-600">
                            {item.instructions || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {resolved?.notes && (
                  <p className="text-xs text-slate-500 italic">
                    Prescriber notes: {resolved.notes}
                  </p>
                )}
              </div>
            )}

            {/* 4. INVESTIGATION */}
            {sourceType === 'INVESTIGATION' && (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Diagnostic Test
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {resolved?.investigationName || event.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Status
                    </span>
                    <p className="font-medium text-slate-800 capitalize mt-0.5">
                      {resolved?.status || 'Requested'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Category
                    </span>
                    <p className="text-slate-700 mt-0.5">
                      {resolved?.category || 'LABORATORY'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Clinical Priority
                    </span>
                    <p className="text-slate-700 mt-0.5">
                      {resolved?.priority || 'ROUTINE'}
                    </p>
                  </div>
                </div>

                {resolved?.reason && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Clinical Reason
                    </span>
                    <p className="text-slate-700 mt-0.5">{resolved.reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* 5. REFERRAL */}
            {sourceType === 'REFERRAL' && (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Specialty
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {resolved?.specialty || event.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Target Provider
                    </span>
                    <p className="text-slate-700 mt-0.5">
                      {resolved?.referredProvider || 'Specialist Referral'}
                    </p>
                  </div>
                </div>

                {resolved?.reason && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Reason for Referral
                    </span>
                    <p className="text-slate-700 mt-0.5">{resolved.reason}</p>
                  </div>
                )}
              </div>
            )}

            {/* 6. FOLLOW_UP */}
            {sourceType === 'FOLLOW_UP' && (
              <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Due Date
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {formatDate(resolved?.dueDate || event.eventDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Follow-up Status
                    </span>
                    <p className="font-medium text-slate-800 capitalize mt-0.5">
                      {resolved?.status || 'Upcoming'}
                    </p>
                  </div>
                </div>

                {resolved?.reason && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Purpose
                    </span>
                    <p className="text-slate-700 mt-0.5">{resolved.reason}</p>
                  </div>
                )}

                {resolved?.instructions && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Instructions
                    </span>
                    <p className="text-slate-700 mt-0.5">{resolved.instructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* 7. LAB_RESULT */}
            {sourceType === 'LAB_RESULT' && (
              <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Diagnostic Laboratory
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">
                      {resolved?.lab?.name || resolved?.labName || 'Verified Laboratory Facility'}
                    </p>
                    {resolved?.lab?.licenseNumber && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Lic: {resolved.lab.licenseNumber}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Report Number / Status
                    </span>
                    <p className="font-mono font-medium text-slate-800 mt-0.5">
                      {resolved?.reportNumber || 'Report Finalized'}
                    </p>
                    <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded border border-emerald-200">
                      {resolved?.status || 'FINAL'}
                    </span>
                  </div>
                </div>

                {resolved?.testSummary && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Diagnostic Findings & Summary
                    </span>
                    <div className="text-slate-800 text-xs mt-1 p-2.5 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                      {resolved.testSummary}
                    </div>
                  </div>
                )}

                {resolved?.clinicalNotes && (
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">
                      Pathologist Clinical Notes
                    </span>
                    <div className="text-slate-700 text-xs mt-1 p-2 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap">
                      {resolved.clinicalNotes}
                    </div>
                  </div>
                )}

                {resolved?.amendedReason && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <span className="font-semibold">Amendment Note:</span> {resolved.amendedReason}
                  </div>
                )}

                <div className="pt-1 flex items-center justify-between text-xs">
                  {resolved?.documentId ? (
                    <a
                      href={`/app/documents/${resolved.documentId}`}
                      className="text-teal-700 hover:text-teal-800 font-medium underline inline-flex items-center gap-1"
                    >
                      View Report Document
                    </a>
                  ) : resolved?.id ? (
                    <a
                      href={`/app/lab/reports/${resolved.id}`}
                      className="text-teal-700 hover:text-teal-800 font-medium underline inline-flex items-center gap-1"
                    >
                      Open Full Diagnostic Report
                    </a>
                  ) : null}
                  <span className="text-[11px] text-slate-400">
                    CarePath Verified Diagnostic Record
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
