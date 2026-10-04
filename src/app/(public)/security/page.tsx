import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  FileCheck2,
  Server,
  KeyRound,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SecurityPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
          Security & Privacy
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Enterprise Healthcare Security Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          How CarePath protects medical records, enforces ownership, and maintains full compliance
          auditing across every interaction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Zero Public Storage URLs</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Medical files are kept strictly isolated in private S3-compatible object storage.
            Permanent public URLs do not exist. Access requests generate ephemeral signed URLs valid
            for a maximum of 15 minutes only after strict authentication and ownership validation.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Immutable Audit Logging</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every sensitive operation — document upload, viewing, downloading, metadata edits,
            profile updates, and authentication attempts — is recorded in an immutable audit ledger
            storing actor ID, role, resource, IP address, and timestamp.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <KeyRound className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Cryptographic Token Rotation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Authentication pairs short-lived access tokens (15m) with refresh-token rotation.
            Token reuse detection automatically invalidates all active sessions if an expired or
            previously used refresh token is detected.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <FileCode className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Three-Tier Document Isolation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The platform separates original unmodified document files, raw OCR output, and structured
            metadata. This ensures medical files are never corrupted and patient annotations remain
            distinct from laboratory text.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 space-y-4 max-w-3xl mx-auto text-left">
        <h3 className="text-base font-bold text-slate-900">Security Verification Checklist (Milestone 1)</h3>
        <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
          <li>Patient cannot access another patient&apos;s medical documents (verified by E2E test suite).</li>
          <li>Patient cannot modify another user&apos;s profile.</li>
          <li>Suspended or deactivated accounts are strictly barred from accessing vault data.</li>
          <li>Unauthorized or unauthenticated users cannot generate presigned storage URLs.</li>
          <li>Every sensitive document access event writes an immutable audit log record.</li>
        </ul>
      </div>
    </div>
  );
}
