'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { doctorApi } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DoctorPatientTimelineRoute() {
  const params = useParams();
  const patientId = params?.id as string;
  const { user } = useAuth();

  const { data: workspace } = useQuery({
    queryKey: ['patient-workspace', patientId],
    queryFn: () => doctorApi.getPatientWorkspace(patientId),
    enabled: !!patientId && !!user,
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-3">
        <Link href={`/app/patients/${patientId}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Patient Workspace
          </Button>
        </Link>
      </div>

      <TimelineContainer
        patientId={patientId}
        isDoctorView={true}
        patientName={workspace?.patient?.fullName || workspace?.patient?.email}
        consentExpiresAt={workspace?.access?.expiresAt}
      />
    </div>
  );
}
