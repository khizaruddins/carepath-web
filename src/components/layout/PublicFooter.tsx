import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Positioning */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                CP
              </div>
              <span className="font-bold text-sm text-white tracking-tight">CarePath</span>
            </div>
            <p className="text-slate-300 text-xs font-medium">
              Your health. Your records. Your next step.
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              CarePath is a healthcare journey platform helping patients maintain organized health
              records and timeline clarity.
            </p>
          </div>

          {/* Col 2: Platform Links */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Platform</p>
            <ul className="space-y-2">
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/patients" className="hover:text-white transition-colors">
                  Patient Health Vault
                </Link>
              </li>
              <li>
                <Link href="/doctors" className="hover:text-white transition-colors">
                  Care Team Collaboration
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-white transition-colors">
                  Security & Storage Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Company */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Company</p>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About CarePath
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Patient Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Compliance Assurance */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-white uppercase tracking-wider">Trust & Privacy</p>
            <div className="space-y-2 text-[11px] text-slate-400">
              <div className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Zero public document URLs. Private S3 storage with temporary signed tokens.</span>
              </div>
              <div className="flex items-start gap-2">
                <Lock className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                <span>Server-side RBAC and immutable audit logging for every document access.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="pt-6 pb-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="mb-2 font-medium text-slate-300">
            Important Healthcare & Medical Disclaimer:
          </p>
          <p>
            CarePath is an administrative record-keeping and health journey platform designed to help
            patients organize medical documentation. CarePath does not provide medical diagnoses,
            autonomous clinical decision-making, emergency services, or medical advice. Always
            consult with licensed healthcare practitioners regarding diagnostic interpretations,
            prescriptions, or treatment regimens.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 CarePath Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/security" className="hover:text-white transition-colors">
              Privacy Architecture
            </Link>
            <Link href="/security" className="hover:text-white transition-colors">
              Security Specifications
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
