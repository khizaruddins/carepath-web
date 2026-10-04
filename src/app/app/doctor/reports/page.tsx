'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { formatDate, formatCategory, formatFileSize } from '@/lib/utils';
import {
  FolderLock,
  FileText,
  CheckCircle2,
  ExternalLink,
  Stethoscope,
  Send,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function DoctorReportsReviewPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [feedbackRecs, setFeedbackRecs] = useState('');

  const {
    data: reports,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['doctor-reports-awaiting-review'],
    queryFn: () => doctorApi.getReportsAwaitingReview(),
    enabled: !!user,
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: () => {
      if (!selectedDoc) return Promise.reject();
      return doctorApi.addDoctorFeedback(selectedDoc.id, feedbackNotes, feedbackRecs || undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-reports-awaiting-review'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-dashboard-workflow'] });
      setSelectedDoc(null);
      setFeedbackNotes('');
      setFeedbackRecs('');
    },
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderLock className="h-6 w-6 text-teal-700" />
            Diagnostic Reports Awaiting Review
          </h1>
          <Badge variant="warning" size="sm">
            {reports?.length || 0} Pending
          </Badge>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Newly uploaded medical scans and laboratory reports from your consented patients requiring physician interpretation.
        </p>
      </div>

      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner message="Scanning patient vaults for unreviewed reports..." />
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((doc) => {
            const patientName = (doc as any).patient?.patientProfile?.fullName || (doc as any).patient?.email;
            const patientId = doc.patientId;
            const latestVersion = doc.versions?.[0];

            return (
              <Card key={doc.id} className="hover:border-teal-700/40 transition-colors">
                <CardContent className="p-5 space-y-4 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">
                          {doc.metadata?.reportTitle || formatCategory(doc.category)}
                        </h3>
                        <Badge variant="brand" size="sm">
                          {formatCategory(doc.category)}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Patient: <strong>{patientName}</strong> • Uploaded:{' '}
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>

                    <Link href={`/app/patients/${patientId}`}>
                      <Button size="sm" variant="ghost" className="text-teal-800">
                        Patient Workspace
                      </Button>
                    </Link>
                  </div>

                  {/* Informational OCR text extract */}
                  {doc.metadata?.rawOcrText ? (
                    <div className="p-3 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {doc.metadata.rawOcrText}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded bg-slate-50 text-slate-400 text-[11px] italic">
                      Original document uploaded • Awaiting clinical assessment
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link href={`/app/documents/${doc.id}`}>
                      <Button size="sm" variant="outline" leftIcon={<Eye className="h-3.5 w-3.5" />}>
                        Inspect Source Document
                      </Button>
                    </Link>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setFeedbackNotes('');
                        setFeedbackRecs('');
                      }}
                      leftIcon={<Stethoscope className="h-3.5 w-3.5" />}
                    >
                      Add Clinical Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="All patient reports reviewed"
          description="There are currently no outstanding diagnostic reports awaiting your clinical review. New uploads from consented patients will appear here automatically."
          icon={<CheckCircle2 className="h-6 w-6 text-emerald-500" />}
          action={
            <Link href="/app/patients">
              <Button variant="outline" size="sm">
                View Connected Patients
              </Button>
            </Link>
          }
        />
      )}

      {/* Clinical Review Dialog */}
      <Dialog
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        title="Submit Clinical Assessment & Guidance"
        description="Record your physician findings and patient care recommendations. Original files remain immutable."
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Document</span>
            <span className="font-bold text-slate-900 text-sm">
              {selectedDoc?.metadata?.reportTitle || (selectedDoc ? formatCategory(selectedDoc.category) : '')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Clinical Assessment & Diagnostic Findings *
            </label>
            <textarea
              rows={4}
              required
              value={feedbackNotes}
              onChange={(e) => setFeedbackNotes(e.target.value)}
              placeholder="Clinical evaluation of lab parameters, radiology findings, or pathological context..."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Next Steps & Patient Guidance (Optional)
            </label>
            <textarea
              rows={2}
              value={feedbackRecs}
              onChange={(e) => setFeedbackRecs(e.target.value)}
              placeholder="e.g. Schedule follow-up in 2 weeks; repeat fasting glucose"
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDoc(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!feedbackNotes.trim()}
              isLoading={submitFeedbackMutation.isPending}
              onClick={() => submitFeedbackMutation.mutate()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              Mark Reviewed & Save Assessment
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
