import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DoctorDashboardView } from '@/components/doctor/DoctorDashboardView';
import PatientsPage from '@/app/app/patients/page';
import { RequestAccessModal } from '@/components/doctor/RequestAccessModal';
import { doctorApi } from '@/lib/api/doctor';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/doctor', () => ({
  doctorApi: {
    getDoctorProfile: jest.fn(),
    getDoctorDashboard: jest.fn(),
    getDoctorAssignedPatients: jest.fn(),
    requestAccess: jest.fn(),
    assignDoctor: jest.fn(),
    submitFeedback: jest.fn(),
  },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'doctor-1',
      email: 'dr.marcus@carepath.example.com',
      role: 'DOCTOR',
      status: 'ACTIVE',
    },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/app/patients',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('Doctor Platform (M2)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const mockDoctorProfile = {
    id: 'doc-prof-1',
    userId: 'doctor-1',
    fullName: 'Dr. Marcus Vance',
    medicalRegistrationNumber: 'MED-12345',
    stateMedicalCouncil: 'Massachusetts Board of Medicine',
    yearOfRegistration: 2012,
    primarySpecialty: 'Internal Medicine',
    subSpecialties: ['Cardiology'],
    yearsOfExperience: 14,
    verificationStatus: 'VERIFIED' as const,
    hospitalAffiliation: 'Mass General Brigham',
    clinicName: 'Beacon Hill Practice',
    city: 'Boston',
  };

  const mockDashboardData = {
    metrics: {
      activePatientsCount: 12,
      todayConsultationsCount: 1,
      reportsAwaitingReviewCount: 3,
      followUpsDueCount: 4,
      pendingRequestsCount: 2,
    },
    pendingActions: [
      {
        id: 'act-1',
        type: 'FOLLOW_UP_DUE',
        title: 'Post-op Follow-up',
        description: 'Review electrolyte lab panels',
        patientName: 'Sarah Jenkins',
        patientId: 'p-1',
      },
    ],
    todayConsultations: [
      {
        id: 'c-1',
        visitReason: 'Post-operative evaluation',
        assessment: 'Healing well, surgical wound clean',
        consultationDate: new Date().toISOString(),
        patient: {
          id: 'p-1',
          email: 'patient@example.com',
          patientProfile: { fullName: 'Sarah Jenkins' },
        },
      },
    ],
    reportsAwaitingReview: [
      {
        id: 'doc-1',
        category: 'LAB_REPORT',
        metadata: {
          reportTitle: 'Comprehensive Metabolic Panel',
        },
        createdAt: new Date().toISOString(),
        patient: {
          id: 'p-1',
          patientProfile: { fullName: 'Sarah Jenkins' },
        },
      },
    ],
    followUpsDue: [
      {
        id: 'fu-1',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Review electrolyte lab panels',
        status: 'UPCOMING',
        patient: {
          id: 'p-1',
          patientProfile: { fullName: 'Sarah Jenkins' },
        },
      },
    ],
    recentActivity: [],
  };

  test('DoctorDashboardView renders clinical priority metrics and today attention items', async () => {
    (doctorApi.getDoctorProfile as jest.Mock).mockResolvedValue(mockDoctorProfile);
    (doctorApi.getDoctorDashboard as jest.Mock).mockResolvedValue(mockDashboardData);

    render(
      <QueryClientProvider client={queryClient}>
        <DoctorDashboardView />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Clinical Workspace')).toBeInTheDocument();
      expect(screen.getByText('Verified Physician')).toBeInTheDocument();
      expect(screen.getByText('Today’s Consults')).toBeInTheDocument();
      expect(screen.getByText('Comprehensive Metabolic Panel')).toBeInTheDocument();
      expect(screen.getByText('Review electrolyte lab panels')).toBeInTheDocument();
    });
  });

  test('PatientsPage renders connected patients directory', async () => {
    (doctorApi.getDoctorAssignedPatients as jest.Mock).mockResolvedValue([
      {
        accessId: 'acc-1',
        patientId: 'p-1',
        relationshipType: 'PRIMARY_CARE',
        accessScope: ['LAB_REPORT', 'PRESCRIPTION'],
        grantedAt: new Date().toISOString(),
        expiresAt: null,
        patient: {
          id: 'p-1',
          email: 'sarah@example.com',
          fullName: 'Sarah Jenkins',
          city: 'Seattle',
          bloodGroup: 'A_POSITIVE',
          emergencyContact: '555-0192',
        },
        clinicalSnapshot: {
          totalConsultationsCount: 3,
          lastConsultationDate: new Date().toISOString(),
          pendingReportsCount: 2,
          nextFollowUpDate: new Date(Date.now() + 86400000).toISOString(),
        },
      },
    ]);

    render(
      <QueryClientProvider client={queryClient}>
        <PatientsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Connected Patients')).toBeInTheDocument();
      expect(screen.getAllByText('Sarah Jenkins').length).toBeGreaterThan(0);
      expect(screen.getAllByText('PRIMARY CARE').length).toBeGreaterThan(0);
      expect(screen.getAllByText('2 awaiting review').length).toBeGreaterThan(0);
    });
  });

  describe('Connect with Patient (Email Invitation Flow)', () => {
    it('allows a doctor to invite/connect a patient by email without any raw UUID', async () => {
      (doctorApi.requestAccess as jest.Mock).mockResolvedValue({
        message: 'Access request sent',
      });
      const handleSuccess = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <RequestAccessModal
            isOpen={true}
            onClose={jest.fn()}
            onSuccess={handleSuccess}
          />
        </QueryClientProvider>,
      );

      // Verify modal title & inputs
      expect(screen.getByText('Connect with Patient')).toBeInTheDocument();
      expect(screen.getByLabelText(/Patient Registered Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Clinical Relationship Context/i)).toBeInTheDocument();

      // Enter patient email
      const emailInput = screen.getByLabelText(/Patient Registered Email/i);
      fireEvent.change(emailInput, { target: { value: 'patient.sarah@example.com' } });

      // Enter clinical note
      const notesInput = screen.getByLabelText(/Clinical Introduction \/ Note/i);
      fireEvent.change(notesInput, {
        target: { value: 'Requesting connection to review recent cardiology results.' },
      });

      // Submit
      const submitBtn = screen.getByRole('button', { name: /Send Connection Invitation/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(doctorApi.requestAccess).toHaveBeenCalledWith(
          'patient.sarah@example.com',
          expect.stringContaining('Requesting connection to review recent cardiology results.'),
        );
        expect(screen.getByText('Connection Invitation Sent')).toBeInTheDocument();
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });
});
