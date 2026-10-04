import React from 'react';
import Link from 'next/link';
import { Stethoscope, ShieldCheck, FileText, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function DoctorsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2">
          <Badge variant="brand" size="sm">
            Milestone 3 Roadmap
          </Badge>
          <span className="text-xs font-semibold text-slate-500">Care Team Integration</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Structured Health Records for Clinical Context
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          CarePath is designed to eliminate fragmented patient record retrieval through patient-owned,
          consent-governed document sharing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Lock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Patient-Governed Consent</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            In upcoming milestones, doctors will be invited by patients to review specific,
            time-bounded diagnostic records. Doctors cannot access unconsented patient data.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <FileText className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Pre-Verified Metadata</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Documents feature patient-confirmed OCR structured parameters, helping clinicians scan
            CBC panels, radiology findings, and past surgical summaries without deciphering scans.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Auditable Access</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every clinician view is logged in the patient’s immutable audit trail, maintaining
            compliance, patient trust, and institutional transparency.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-slate-900">Explore the Platform</h2>
        <p className="text-xs text-slate-600">
          Learn about our storage security principles or register as an administrator or doctor user.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/security">
            <Button variant="outline" size="sm">
              Read Security Architecture
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="primary" size="sm">
              Clinician Portal Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
