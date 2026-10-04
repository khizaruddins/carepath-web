import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileCheck2, UserCheck, Stethoscope } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-white">
      {/* Left Column: Clinical Brand & Security Showcase (50% on Desktop) */}
      <div className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white relative overflow-hidden border-r border-slate-800">
        {/* Subtle background decorative grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 select-none">
            <div className="h-9 w-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              CP
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">CarePath</span>
          </Link>
          <p className="text-xs text-teal-300 font-medium tracking-wide uppercase mt-2">
            Patient Health Vault & Clinical Collaboration
          </p>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-900/60 text-teal-300 border border-teal-700/50 mb-4">
              <ShieldCheck className="h-3.5 w-3.5" />
              Zero-Trust Medical Records Platform
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Your health. Your records. <br />
              <span className="text-teal-400">Your next step.</span>
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-lg">
              CarePath puts patients in complete control of their diagnostic reports, prescriptions,
              and health chronology, while giving authorized doctors instant clinical clarity with consent.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-teal-900/80 border border-teal-700/50 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Patient-Controlled Consent</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  Doctors must request access to review records. Patients can grant, restrict, or revoke access at any second.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-teal-900/80 border border-teal-700/50 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <FileCheck2 className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Original Integrity Preserved</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  Uploaded files remain byte-for-byte immutable in private storage. OCR extracts data for review without modifying source documents.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-8 w-8 rounded-md bg-teal-900/80 border border-teal-700/50 flex items-center justify-center text-teal-300 shrink-0 mt-0.5">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Verified Clinicians & Review System</h2>
                <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                  Doctors showcase verified board certifications, experience, and receive authentic patient care reviews.
                </p>
              </div>
            </div>
          </div>

          {/* Testimonial Quote */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 leading-relaxed italic">
            &ldquo;CarePath bridges the gap between fragmented hospital portals and patient empowerment. Having patients own their vault changes clinical outcomes.&rdquo;
            <div className="mt-2 text-slate-400 not-italic font-semibold flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-teal-400" />
              Dr. Sarah Jenkins, MD • Internal Medicine & Cardiology
            </div>
          </div>
        </div>

        {/* Bottom Security Badges */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>AES-256 Encrypted</span>
          <span>•</span>
          <span>HIPAA Aligned</span>
          <span>•</span>
          <span>Immutable Audit Logs</span>
        </div>
      </div>

      {/* Right Column: Sign In / Sign Up Form Area (50% on Desktop) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-20 bg-slate-50/50 overflow-y-auto">
        {/* Mobile Header */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 select-none">
            <div className="h-8 w-8 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              CP
            </div>
            <span className="font-bold text-xl text-slate-900 tracking-tight">CarePath</span>
          </Link>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Patient Health Vault • Encrypted Access
          </p>
        </div>

        <div className="max-w-md w-full mx-auto bg-white p-7 sm:p-9 rounded-2xl border border-slate-200 shadow-sm">
          {children}
        </div>

        <div className="max-w-md w-full mx-auto mt-6 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <Lock className="h-3.5 w-3.5 text-teal-700" />
            <span>256-bit encrypted session • Zero public access</span>
          </div>
        </div>
      </div>
    </div>
  );
}
