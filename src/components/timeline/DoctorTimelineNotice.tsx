import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface DoctorTimelineNoticeProps {
  expiresAt?: string | null;
  patientName?: string;
}

export function DoctorTimelineNotice({ expiresAt, patientName }: DoctorTimelineNoticeProps) {
  return (
    <div className="bg-teal-50/70 border border-teal-200/80 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
      <div className="flex items-start gap-2.5">
        <ShieldCheck className="h-4 w-4 text-teal-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-teal-950">
            Authorized Clinical Timeline View {patientName ? `for ${patientName}` : ''}
          </p>
          <p className="text-[11px] text-teal-800/90 mt-0.5">
            Showing records you currently have permission to access under active patient consent. Some health records may not be visible because you do not currently have access.
          </p>
        </div>
      </div>
      {expiresAt && (
        <div className="shrink-0 text-right">
          <span className="text-[10px] uppercase font-bold text-teal-800 tracking-wider">
            Access expires
          </span>
          <p className="text-xs font-medium text-teal-950">{formatDate(expiresAt)}</p>
        </div>
      )}
    </div>
  );
}
