'use client';

import React, { useState, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { ErrorMessage } from '../ui/ErrorMessage';
import { documentsApi } from '@/lib/api/documents';
import { DocumentCategory, MedicalDocument } from '@/lib/api/types';
import { formatCategory, formatFileSize } from '@/lib/utils';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Edit2,
  FileCheck2,
  ArrowRight,
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (doc: MedicalDocument) => void;
}

type Step = 'CHOOSE' | 'UPLOADING' | 'REVIEW' | 'CONFIRMED';

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [step, setStep] = useState<Step>('CHOOSE');
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory>('LAB_REPORT');
  const [reportTitle, setReportTitle] = useState('');
  const [providerName, setProviderName] = useState('');
  const [facility, setFacility] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [patientNotes, setPatientNotes] = useState('');

  // Editable fields for review step
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState<MedicalDocument | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep('CHOOSE');
    setFile(null);
    setCategory('LAB_REPORT');
    setReportTitle('');
    setProviderName('');
    setFacility('');
    setDocumentDate('');
    setPatientNotes('');
    setIsEditing(false);
    setUploadedDoc(null);
    setError(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

      if (!validTypes.includes(selected.type)) {
        setError('Invalid file type. Only PDF, JPG, JPEG, and PNG files are accepted.');
        return;
      }

      if (selected.size > 25 * 1024 * 1024) {
        setError('File exceeds 25MB limit.');
        return;
      }

      setError(null);
      setFile(selected);
      // Derive initial title from filename if empty
      if (!reportTitle) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setReportTitle(cleanName);
      }
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setError(null);
    setStep('UPLOADING');
    setIsSubmitting(true);

    try {
      const res = await documentsApi.uploadDocument({
        file,
        category,
        reportTitle: reportTitle || undefined,
        providerName: providerName || undefined,
        facility: facility || undefined,
        documentDate: documentDate || undefined,
        patientNotes: patientNotes || undefined,
      });

      setUploadedDoc(res.document);

      // Pre-fill review form from extracted or uploaded metadata
      if (res.document.metadata) {
        setReportTitle(res.document.metadata.reportTitle || reportTitle || file.name);
        setProviderName(res.document.metadata.providerName || providerName || '');
        setFacility(res.document.metadata.facility || facility || '');
        if (res.document.metadata.documentDate) {
          setDocumentDate(res.document.metadata.documentDate.split('T')[0]);
        }
      }

      setStep('REVIEW');
    } catch (err: any) {
      setError(err.message || 'Upload failed. Check file size and format.');
      setStep('CHOOSE');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmMetadata = async () => {
    if (!uploadedDoc) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await documentsApi.updateDocument(uploadedDoc.id, {
        category,
        reportTitle: reportTitle || undefined,
        providerName: providerName || undefined,
        facility: facility || undefined,
        documentDate: documentDate || undefined,
        patientNotes: patientNotes || undefined,
        isPatientConfirmed: true,
      });

      setStep('CONFIRMED');
      if (onSuccess) {
        onSuccess(uploadedDoc);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to confirm metadata.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'CHOOSE'
          ? 'Upload Medical Document'
          : step === 'UPLOADING'
            ? 'Processing Document'
            : step === 'REVIEW'
              ? 'Review & Confirm Information'
              : 'Document Stored & Verified'
      }
      description={
        step === 'CHOOSE'
          ? 'Add a laboratory test, prescription, imaging scan, or consultation note to your private vault.'
          : step === 'REVIEW'
            ? 'Verify extracted data before adding this record to your medical timeline.'
            : undefined
      }
      maxWidth="lg"
    >
      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {/* Step 1: Choose & Basic Info */}
      {step === 'CHOOSE' && (
        <form onSubmit={handleStartUpload} className="space-y-4 text-left">
          {/* File Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-700 hover:bg-slate-50/80 rounded-lg p-6 text-center cursor-pointer transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-teal-700" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)} • {file.type || 'Document'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <UploadCloud className="h-9 w-9 text-slate-400 mx-auto" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Click or drag file to upload
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Supports PDF, JPG, JPEG, and PNG (Max 25MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Document Category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              options={[
                { label: 'Lab Report', value: 'LAB_REPORT' },
                { label: 'Prescription', value: 'PRESCRIPTION' },
                { label: 'Consultation Note', value: 'CONSULTATION' },
                { label: 'Discharge Summary', value: 'DISCHARGE_SUMMARY' },
                { label: 'Imaging Report', value: 'IMAGING_REPORT' },
                { label: 'X-Ray Scan', value: 'XRAY' },
                { label: 'CT Scan', value: 'CT' },
                { label: 'MRI Scan', value: 'MRI' },
                { label: 'Other Healthcare Record', value: 'OTHER' },
              ]}
            />

            <Input
              label="Document Date"
              type="date"
              value={documentDate}
              onChange={(e) => setDocumentDate(e.target.value)}
            />
          </div>

          <Input
            label="Report Title (Optional)"
            placeholder="e.g. Annual Comprehensive Metabolic Panel"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Physician / Provider Name"
              placeholder="e.g. Dr. Robert Chen"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
            />
            <Input
              label="Facility / Clinic"
              placeholder="e.g. Metropolis Diagnostics"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Personal Patient Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. Discussed with doctor, values returned to normal."
              className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!file}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Upload & Process
            </Button>
          </div>
        </form>
      )}

      {/* Step 2: Uploading / Processing */}
      {step === 'UPLOADING' && (
        <div className="py-10 text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 mx-auto">
            <Cpu className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Securing & Extracting Document Information
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Scanning file integrity, preserving raw copy in private storage, and performing OCR
              parameter analysis...
            </p>
          </div>
          <div className="w-48 mx-auto bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-teal-700 h-1.5 rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4" />
          </div>
        </div>
      )}

      {/* Step 3: Review Information & Patient Confirmation */}
      {step === 'REVIEW' && (
        <div className="space-y-5 text-left">
          {/* Important medical guidance banner */}
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Notice:</strong> Automatically extracted information may be inaccurate. Please
              review and edit the fields below before confirming.
            </p>
          </div>

          {isEditing ? (
            <div className="space-y-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                  options={[
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
                <Input
                  label="Document Date"
                  type="date"
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                />
              </div>
              <Input
                label="Report Title"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Provider Name"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                />
                <Input
                  label="Facility"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Save Changes to Preview
              </Button>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Extracted Document Details
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 text-xs text-teal-800 font-semibold hover:underline"
                >
                  <Edit2 className="h-3 w-3" />
                  <span>Edit information</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Document Type</span>
                  <span className="font-semibold text-slate-900">{formatCategory(category)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Document Date</span>
                  <span className="font-semibold text-slate-900">{documentDate || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Report Title</span>
                  <span className="font-semibold text-slate-900">{reportTitle || 'General Record'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Provider / Facility</span>
                  <span className="font-semibold text-slate-900">
                    {providerName ? `${providerName}` : ''}{' '}
                    {facility ? `(${facility})` : !providerName ? 'Not specified' : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Information'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmMetadata}
              leftIcon={<FileCheck2 className="h-4 w-4" />}
            >
              Confirm & Save Record
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmed & Completed */}
      {step === 'CONFIRMED' && (
        <div className="py-6 text-center space-y-4">
          <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Record Successfully Confirmed & Added
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
              Your record is stored in your private vault and a chronological event has been added to
              your medical timeline.
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
