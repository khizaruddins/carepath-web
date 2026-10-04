import React from 'react';
import Link from 'next/link';
import {
  FileUp,
  ShieldAlert,
  Server,
  Cpu,
  FileCheck2,
  CalendarClock,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

const workflowSteps = [
  {
    step: '01',
    icon: FileUp,
    title: 'Patient Uploads Record',
    description:
      'Upload any diagnostic lab report, imaging scan (X-ray, CT, MRI), prescription, or consultation note in PDF, JPG, JPEG, or PNG format up to 25MB.',
  },
  {
    step: '02',
    icon: ShieldAlert,
    title: 'Validation & Malware Inspection',
    description:
      'The file undergoes magic-byte verification to confirm true MIME authenticity followed by an integrated security and antivirus inspection hook.',
  },
  {
    step: '03',
    icon: Server,
    title: 'Encrypted Private Object Storage',
    description:
      'The original document is preserved unmodified in a private S3-compatible vault. Permanent public links are never generated or exposed.',
  },
  {
    step: '04',
    icon: Cpu,
    title: 'Asynchronous OCR Extraction',
    description:
      'A non-blocking background queue processes the document through an abstracted OCR engine, identifying report titles, providers, dates, and diagnostic values.',
  },
  {
    step: '05',
    icon: FileCheck2,
    title: 'Patient Review & Confirmation',
    description:
      'Because automated OCR can make mistakes, the patient retains full authority to review, edit, and confirm all extracted fields before saving.',
  },
  {
    step: '06',
    icon: CalendarClock,
    title: 'Timeline Integration',
    description:
      'Confirmed documents automatically generate chronological health events in the patient’s medical timeline, creating an easy-to-read longitudinal health history.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
          Architecture & Workflow
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How CarePath Handles Medical Records
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Every health document follows a strict six-stage lifecycle engineered for data integrity,
          privacy, and patient verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {workflowSteps.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs flex gap-5 items-start"
            >
              <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-bold text-sm shrink-0">
                {item.step}
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-teal-700" />
                  <span>{item.title}</span>
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-lg font-bold text-slate-900">Experience the Patient Health Vault</h2>
        <p className="text-xs text-slate-600">
          Create a free patient account to organize your medical history and test the document
          processing pipeline.
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
