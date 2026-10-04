'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function DoctorPatientsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app/patients');
  }, [router]);

  return <LoadingSpinner message="Redirecting to Connected Patients directory..." />;
}
