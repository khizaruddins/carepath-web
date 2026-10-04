'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { doctorApi } from '@/lib/api/doctor';
import {
  UserPlus,
  CheckCircle2,
  Send,
  ShieldCheck,
  Mail,
  Stethoscope,
  Info,
} from 'lucide-react';

export interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  patientId?: string;
  patientName?: string;
  defaultEmail?: string;
}

const RELATIONSHIP_OPTIONS = [
  { value: 'PRIMARY_CARE', label: 'Primary Care Physician' },
  { value: 'SPECIALIST', label: 'Specialist / Consulting Physician' },
  { value: 'SECOND_OPINION', label: 'Second Opinion Review' },
  { value: 'DIAGNOSTIC_REVIEW', label: 'Diagnostic & Lab Evaluation' },
  { value: 'FOLLOW_UP', label: 'Follow-Up / Chronic Care Management' },
];

export function RequestAccessModal({
  isOpen,
  onClose,
  onSuccess,
  defaultEmail = '',
}: RequestAccessModalProps) {
  const [patientEmail, setPatientEmail] = useState(defaultEmail);
  const [relationshipType, setRelationshipType] = useState('PRIMARY_CARE');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const resetForm = () => {
    setPatientEmail(defaultEmail);
    setRelationshipType('PRIMARY_CARE');
    setNotes('');
    setError(null);
    setSubmitted(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailTrimmed = patientEmail.trim().toLowerCase();
    if (!emailTrimmed) {
      setError('Please provide the patient’s registered email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedLabel =
        RELATIONSHIP_OPTIONS.find((r) => r.value === relationshipType)?.label ||
        'Physician Connection';
      const formattedNotes = notes.trim()
        ? `[${selectedLabel}] ${notes.trim()}`
        : `[${selectedLabel}] Clinical care team connection request`;

      await doctorApi.requestAccess(emailTrimmed, formattedNotes);
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to send connection request. Please ensure the patient is registered on CarePath.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Connect with Patient"
      description="Send a clinical connection invitation to a patient’s registered email address."
      maxWidth="md"
    >
      {submitted ? (
        <div className="text-center py-6 space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Connection Invitation Sent
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
              An authorization request has been dispatched to{' '}
              <strong className="text-slate-800">{patientEmail.trim().toLowerCase()}</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs text-slate-600 space-y-1 max-w-sm mx-auto">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <Info className="h-3.5 w-3.5 text-teal-700" />
              <span>Next Steps:</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              1. The patient will receive a notification in their CarePath portal.
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              2. Once the patient approves the request under their Care Team dashboard, they will appear in your Connected Patients roster.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <ErrorMessage
              title="Connection request failed"
              message={error}
              onRetry={() => setError(null)}
            />
          )}

          {/* Patient Email */}
          <div className="space-y-1">
            <Input
              label="Patient Registered Email *"
              type="email"
              value={patientEmail}
              onChange={(e) => {
                setPatientEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="patient@example.com"
              leftIcon={<Mail className="h-4 w-4 text-slate-400" />}
              required
              autoFocus
            />
            <p className="text-[11px] text-slate-500">
              Enter the exact email address the patient used to register their CarePath account.
            </p>
          </div>

          {/* Relationship Type */}
          <div className="space-y-1">
            <label
              htmlFor="relationship-type-select"
              className="block text-xs font-semibold text-slate-700"
            >
              Clinical Relationship Context *
            </label>
            <select
              id="relationship-type-select"
              value={relationshipType}
              onChange={(e) => setRelationshipType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 shadow-2xs"
            >
              {RELATIONSHIP_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Note / Message */}
          <div className="space-y-1">
            <label
              htmlFor="invitation-notes"
              className="block text-xs font-semibold text-slate-700"
            >
              Clinical Introduction / Note (Optional)
            </label>
            <textarea
              id="invitation-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Dr. Vance here. Requesting connection to review your recent blood work and discuss your care plan."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 shadow-2xs placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-500">
              This message will be visible to the patient when they review your connection request.
            </p>
          </div>

          {/* Clinical Privacy Callout */}
          <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-lg text-xs text-teal-900 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              CarePath is patient-governed. Connection does not grant automatic access to records until the patient approves. You can subsequently request specific scoped record consents.
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <Button type="button" variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              Send Connection Invitation
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
