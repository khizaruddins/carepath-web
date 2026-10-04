import React from 'react';
import Link from 'next/link';
import { HeartPulse, FolderLock, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PatientsPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
          For Patients
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your Health History, Always Within Reach
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          CarePath gives you an organized, private vault for your health documents, conditions,
          allergies, and medical chronology.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <HeartPulse className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Personal Health Profile</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Record and update critical medical baseline information: confirmed conditions, drug and
            food allergies, active prescription regimens, and past surgical procedures.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <FolderLock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Private Records Repository</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Store laboratory results, prescriptions, imaging scans (X-ray, CT, MRI), and discharge
            summaries. Your files remain private and accessible only to you.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <Clock className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Medical Chronology (Timeline)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Review past health events in chronological order. Easily locate specific test results
            from previous months or years during clinical consultations.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-3">
          <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Complete Audit Trail</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            View every action taken on your records. An immutable access log records exactly when a
            document was uploaded, viewed, downloaded, or updated.
          </p>
        </div>
      </div>

      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-slate-900">Begin Your Health Vault</h2>
        <p className="text-xs text-slate-600">
          Takes less than a minute to create an account and begin uploading your health records.
        </p>
        <Link href="/register">
          <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>
            Create Patient Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
