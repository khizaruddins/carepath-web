import React from 'react';
import Link from 'next/link';
import {
  FolderLock,
  Clock,
  ShieldCheck,
  FileCheck2,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function HomePage() {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-900 text-xs font-semibold">
          <Badge variant="brand" size="sm">
            Milestone 1
          </Badge>
          <span>Patient Health Vault & Secure Storage</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Your health. Your records. <br className="hidden sm:inline" />
          <span className="text-teal-800">Your next step.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Keep your health records organized, understand your healthcare history, and securely
          maintain the medical information you choose in a private health vault.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register">
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Create Your Health Vault
            </Button>
          </Link>
          <Link href="/how-it-works">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Explore How It Works
            </Button>
          </Link>
        </div>

        {/* Quiet Reassurance Banner */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-8 text-xs text-slate-500 font-medium border-t border-slate-100">
          <span className="flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-teal-700" /> Private S3 Object Storage
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-700" /> Immutable Audit Logs
          </span>
          <span className="flex items-center gap-1.5">
            <FileCheck2 className="h-3.5 w-3.5 text-teal-700" /> Patient-Confirmed Metadata
          </span>
        </div>
      </section>

      {/* Realistic Product Interface Preview Card */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-xl p-2 sm:p-3 shadow-2xl border border-slate-800">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-left">
            {/* Mock Top bar */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                <span className="font-semibold text-slate-700 ml-2">CarePath Vault / Alex Morgan</span>
              </div>
              <Badge variant="brand" size="sm">
                Encrypted Session
              </Badge>
            </div>

            {/* Mock Dashboard Content Preview */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50">
              <div className="md:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="font-semibold text-sm text-slate-900">Recent Medical Documents</h3>
                    <span className="text-xs text-teal-800 font-medium">3 Records Verified</span>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">Complete Blood Count (CBC) Panel</p>
                        <p className="text-[11px] text-slate-500">Metropolis Laboratories • 18 Sep 2026</p>
                      </div>
                      <Badge variant="success" size="sm">
                        Verified
                      </Badge>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">Outpatient Prescription</p>
                        <p className="text-[11px] text-slate-500">Dr. Sarah Jenkins • 15 Sep 2026</p>
                      </div>
                      <Badge variant="brand" size="sm">
                        Prescription
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                    Health Baseline
                  </h4>
                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="flex justify-between">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-semibold text-slate-800">O+</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Allergies:</span>
                      <span className="font-medium text-slate-800">Penicillin</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-400">Conditions:</span>
                      <span className="font-medium text-slate-800">Mild Asthma</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">Foundation</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Designed for Patient Trust, Clarity, and Control
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            CarePath establishes the structured digital foundation for your healthcare records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-3 text-left shadow-xs">
            <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <FolderLock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Private Health Vault</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Medical records (PDF, JPG, PNG) are uploaded to private object storage with
              server-side access verification and short-lived signed URLs.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-3 text-left shadow-xs">
            <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">OCR & Patient Confirmation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracted medical details are never assumed to be perfect. Patients review, correct,
              and confirm metadata before finalizing entries.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-slate-200 space-y-3 text-left shadow-xs">
            <div className="h-9 w-9 rounded-md bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Medical Chronology</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Understand your health journey through an organized timeline connecting diagnostic
              reports, outpatient visits, and prescription updates.
            </p>
          </div>
        </div>
      </section>

      {/* Security Architecture Callout */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 sm:p-10 text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                Security Architecture
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Zero Public Storage. Server-Side RBAC.
              </h3>
            </div>
            <Link href="/security">
              <Button variant="outline" size="sm">
                Read Security Spec
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Ephemeral Access:</strong> Document download links expire automatically within 15 minutes.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Immutable Auditing:</strong> Every document view, upload, and update writes a non-repudiable audit event.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Original Integrity:</strong> Raw uploaded files are stored unmodified; metadata is kept strictly separated.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
              <span>
                <strong>Future-Proofing:</strong> Ready for consented provider sharing in Milestone 3.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Public CTA Banner */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Ready to establish your health vault?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Create your account today to organize reports, track your conditions, and build a clear
          medical timeline.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link href="/register">
            <Button variant="primary" size="md">
              Create Patient Account
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="md">
              Sign In to Existing Vault
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
