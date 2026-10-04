'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingState';

export default function DoctorPatientDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    if (id) {
      router.replace(`/app/patients/${id}`);
    }
  }, [id, router]);

  return <LoadingSpinner message="Redirecting to patient workspace..." />;
}
