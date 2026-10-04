import React from 'react';
import Link from 'next/link';
import { Target, Users, Shield, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 text-left">
      <div className="space-y-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">About CarePath</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Restoring Order to the Healthcare Journey
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Patients encounter medical care across multiple clinics, laboratories, hospitals, and
          specialists. Medical documentation gets fragmented into separate portals, printed
          discharge summaries, and lost prescription slips.
        </p>
      </div>

      <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 space-y-4 leading-relaxed">
        <p>
          CarePath was founded on a simple premise: <strong>the patient is the primary custodian of their health story</strong>.
          By giving patients a private, accessible, and structured health vault, we empower individuals
          to maintain their complete record baseline and share relevant context with their care teams.
        </p>

        <h3 className="text-base font-semibold text-slate-900 pt-4">Our Guiding Values</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 not-prose">
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <h4 className="font-semibold text-sm text-slate-900 mb-1">Patient Trust First</h4>
            <p className="text-xs text-slate-600">
              Zero public URLs, strict server-side permissions, and immutable audit logs.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-slate-200 bg-white">
            <h4 className="font-semibold text-sm text-slate-900 mb-1">Clarity Over Decoration</h4>
            <p className="text-xs text-slate-600">
              Clear information hierarchy designed to scan medical records, values, and dates easily.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex gap-4">
        <Link href="/register">
          <Button variant="primary" size="md">
            Create Patient Account
          </Button>
        </Link>
        <Link href="/contact">
          <Button variant="outline" size="md">
            Contact Team
          </Button>
        </Link>
      </div>
    </div>
  );
}
