import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConsentBadge } from '@/components/consents/ConsentBadge';
import { ConsentCard } from '@/components/consents/ConsentCard';
import { ConsentReviewModal } from '@/components/consents/ConsentReviewModal';
import { DeclineConfirmModal } from '@/components/consents/DeclineConfirmModal';
import { RevokeConfirmModal } from '@/components/consents/RevokeConfirmModal';
import { RequestConsentModal } from '@/components/consents/RequestConsentModal';
import {
  formatConsentPurpose,
  formatResourceCategory,
  getExpiryRemainingText,
} from '@/lib/consent-utils';
import { consentsApi } from '@/lib/api/consents';
import { doctorApi } from '@/lib/api/doctor';
import { Consent } from '@/lib/api/types';

jest.mock('@/lib/api/consents', () => ({
  consentsApi: {
    getConsents: jest.fn(),
    getPendingConsents: jest.fn(),
    getActiveConsents: jest.fn(),
    getConsentHistory: jest.fn(),
    getDoctorConsentRequests: jest.fn(),
    getConsentById: jest.fn(),
    getConsentResources: jest.fn(),
    requestConsent: jest.fn(),
    approveConsent: jest.fn(),
    declineConsent: jest.fn(),
    revokeConsent: jest.fn(),
    cancelConsent: jest.fn(),
  },
}));

jest.mock('@/lib/api/doctor', () => ({
  doctorApi: {
    getDoctorAssignedPatients: jest.fn(),
  },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'patient-123',
      email: 'rahul.sharma@carepath.example.com',
      role: 'PATIENT',
      status: 'ACTIVE',
    },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

describe('Consent & Secure Sharing (Milestone 3)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const mockConsent: Consent = {
    id: 'consent-abc-123',
    patientId: 'patient-123',
    requesterId: 'doctor-456',
    requesterRole: 'DOCTOR',
    purpose: 'REVIEW_RECENT_REPORTS',
    purposeDescription: 'Need to review recent liver function tests and ultrasound ahead of Tuesday visit.',
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    scopes: [
      {
        id: 'scope-1',
        consentId: 'consent-abc-123',
        resourceType: 'DOCUMENT',
        resourceCategory: 'LAB_REPORT',
        accessLevel: 'VIEW',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'scope-2',
        consentId: 'consent-abc-123',
        resourceType: 'DOCUMENT',
        resourceCategory: 'PRESCRIPTION',
        accessLevel: 'VIEW',
        createdAt: new Date().toISOString(),
      },
    ],
    requester: {
      id: 'doctor-456',
      email: 'dr.marcus@hospital.example.com',
      doctorProfile: {
        fullName: 'Dr. Marcus Vance',
        specialization: 'Internal Medicine',
        hospitalAffiliation: 'Apollo Hospitals',
        city: 'Bangalore',
      },
    },
    patient: {
      id: 'patient-123',
      email: 'rahul.sharma@carepath.example.com',
      patientProfile: {
        fullName: 'Rahul Sharma',
        city: 'Bangalore',
        bloodGroup: 'O_POSITIVE',
      },
    },
  };

  describe('Consent Formatting & Badges', () => {
    it('formats clinical purposes accurately', () => {
      expect(formatConsentPurpose('REVIEW_RECENT_REPORTS')).toBe('Review Recent Reports');
      expect(formatConsentPurpose('FOLLOW_UP_CARE')).toBe('Follow-Up Care');
      expect(formatConsentPurpose('SECOND_OPINION')).toBe('Second Opinion');
    });

    it('formats resource categories clearly', () => {
      expect(formatResourceCategory('LAB_REPORT')).toBe('Lab & Pathology');
      expect(formatResourceCategory('PRESCRIPTION')).toBe('Prescriptions');
      expect(formatResourceCategory('IMAGING_REPORT')).toBe('Imaging & Radiology');
    });

    it('calculates remaining expiration duration', () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const res = getExpiryRemainingText(futureDate);
      expect(res.isExpired).toBe(false);
      expect(res.text).toContain('days remaining');
    });

    it('renders ConsentBadge with correct semantic variants', () => {
      const { rerender } = render(<ConsentBadge status="APPROVED" />);
      expect(screen.getByText('Active Access')).toBeInTheDocument();

      rerender(<ConsentBadge status="PENDING" />);
      expect(screen.getByText('Pending Review')).toBeInTheDocument();

      rerender(<ConsentBadge status="REVOKED" />);
      expect(screen.getByText('Revoked')).toBeInTheDocument();

      rerender(<ConsentBadge status="DECLINED" />);
      expect(screen.getByText('Declined')).toBeInTheDocument();
    });
  });

  describe('ConsentCard Component', () => {
    it('renders WHO, WHAT, WHY, and UNTIL WHEN clearly for patient view', () => {
      render(
        <ConsentCard
          consent={mockConsent}
          viewerRole="PATIENT"
          onReview={jest.fn()}
          onDecline={jest.fn()}
        />,
      );

      // WHO
      expect(screen.getByText('Dr. Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText(/Internal Medicine • Apollo Hospitals/)).toBeInTheDocument();

      // WHY
      expect(screen.getByText('Review Recent Reports')).toBeInTheDocument();
      expect(screen.getByText(/Need to review recent liver function tests/)).toBeInTheDocument();

      // WHAT
      expect(screen.getByText(/Scope: Lab & Pathology, Prescriptions/)).toBeInTheDocument();
      expect(screen.getByText('View Only')).toBeInTheDocument();

      // Review Action
      expect(screen.getByText('Review Request')).toBeInTheDocument();
      expect(screen.getByText('Decline')).toBeInTheDocument();
    });

    it('triggers onReview when Review Request button is clicked', () => {
      const handleReview = jest.fn();
      render(
        <ConsentCard
          consent={mockConsent}
          viewerRole="PATIENT"
          onReview={handleReview}
        />,
      );

      fireEvent.click(screen.getByText('Review Request'));
      expect(handleReview).toHaveBeenCalledWith(mockConsent);
    });
  });

  describe('ConsentReviewModal Flow', () => {
    it('displays full authorization details and allows approval', async () => {
      const handleApprove = jest.fn().mockResolvedValue(undefined);
      const handleDecline = jest.fn().mockResolvedValue(undefined);
      const handleClose = jest.fn();

      render(
        <ConsentReviewModal
          isOpen={true}
          onClose={handleClose}
          consent={mockConsent}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />,
      );

      expect(screen.getByText('Review Access Request')).toBeInTheDocument();
      expect(screen.getByText('Dr. Marcus Vance')).toBeInTheDocument();
      expect(screen.getByText('Approve Access')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Approve Access'));

      await waitFor(() => {
        expect(handleApprove).toHaveBeenCalledWith(mockConsent.id);
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('DeclineConfirmModal Flow', () => {
    it('supports choosing non-shaming reasons and declining request', async () => {
      const handleConfirm = jest.fn().mockResolvedValue(undefined);
      const handleClose = jest.fn();

      render(
        <DeclineConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          requesterName="Dr. Marcus Vance"
        />,
      );

      expect(screen.getByText('Decline Access Request')).toBeInTheDocument();
      expect(
        screen.getByText('Prefer to share records in person during consultation'),
      ).toBeInTheDocument();

      fireEvent.click(
        screen.getByText('Prefer to share records in person during consultation'),
      );

      const declineBtn = screen.getByRole('button', { name: /Decline Request/i });
      fireEvent.click(declineBtn);

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalledWith(
          'Prefer to share records in person during consultation',
        );
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('RevokeConfirmModal Flow', () => {
    it('warns about immediate effect and submits revocation', async () => {
      const handleConfirm = jest.fn().mockResolvedValue(undefined);
      const handleClose = jest.fn();

      render(
        <RevokeConfirmModal
          isOpen={true}
          onClose={handleClose}
          onConfirm={handleConfirm}
          requesterName="Dr. Marcus Vance"
        />,
      );

      expect(screen.getByText('Revoke Record Access')).toBeInTheDocument();
      expect(screen.getByText(/Immediate Effect/i)).toBeInTheDocument();

      const revokeBtn = screen.getByRole('button', { name: /Revoke Access Immediately/i });
      fireEvent.click(revokeBtn);

      await waitFor(() => {
        expect(handleConfirm).toHaveBeenCalled();
        expect(handleClose).toHaveBeenCalled();
      });
    });
  });

  describe('Doctor RequestConsentModal Flow', () => {
    it('guides doctor through multi-step consent request', async () => {
      (consentsApi.requestConsent as jest.Mock).mockResolvedValue({
        message: 'Request sent',
        consent: mockConsent,
      });

      render(
        <QueryClientProvider client={queryClient}>
          <RequestConsentModal
            isOpen={true}
            onClose={jest.fn()}
            preselectedPatientId="patient-123"
            preselectedPatientName="Rahul Sharma"
          />
        </QueryClientProvider>,
      );

      // Step 1: Patient & Scope
      expect(screen.getByText('Step 1: Patient & Scope')).toBeInTheDocument();
      expect(screen.getByText(/Target Patient: Rahul Sharma/)).toBeInTheDocument();

      // Click Continue to Step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      // Step 2: Purpose & Rationale
      await waitFor(() => {
        expect(screen.getByText('Step 2: Purpose & Rationale')).toBeInTheDocument();
      });

      // Fill in rationale
      const rationaleTextarea = screen.getByPlaceholderText(/e\.g\. Review recent complete blood count/i);
      fireEvent.change(rationaleTextarea, {
        target: { value: 'Reviewing recent thyroid blood tests for medication dosage adjustment.' },
      });

      // Click Continue to Step 3
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      // Step 3: Duration & Permissions
      await waitFor(() => {
        expect(screen.getByText('Step 3: Duration & Permissions')).toBeInTheDocument();
      });

      // Click Continue to Step 4
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      // Step 4: Review & Send
      await waitFor(() => {
        expect(screen.getByText('Step 4: Review & Send')).toBeInTheDocument();
      });

      expect(screen.getByText('Send Request')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Send Request/i }));

      await waitFor(() => {
        expect(consentsApi.requestConsent).toHaveBeenCalledWith(
          expect.objectContaining({
            patientId: 'patient-123',
            purpose: 'REVIEW_RECENT_REPORTS',
            purposeDescription:
              'Reviewing recent thyroid blood tests for medication dosage adjustment.',
            scopes: expect.any(Array),
          }),
        );
      });
    });

    it('renders connected patient dropdown list and never displays raw UUID input', async () => {
      (doctorApi.getDoctorAssignedPatients as jest.Mock).mockResolvedValue([
        {
          accessId: 'acc-1',
          patientId: 'patient-789',
          patient: {
            fullName: 'Anita Desai',
            email: 'anita.desai@carepath.example.com',
            city: 'Mumbai',
          },
        },
      ]);

      render(
        <QueryClientProvider client={queryClient}>
          <RequestConsentModal isOpen={true} onClose={jest.fn()} />
        </QueryClientProvider>,
      );

      // Verify dropdown is rendered with patient details
      await waitFor(() => {
        expect(screen.getByLabelText(/Connected Patient/i)).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /Anita Desai \(anita\.desai@carepath\.example\.com\) • Mumbai/i }),
        ).toBeInTheDocument();
      });

      // Verify NO raw UUID input exists in the DOM
      expect(screen.queryByPlaceholderText(/Paste patient UUID/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Patient User UUID/i)).not.toBeInTheDocument();

      // Select patient from dropdown
      const select = screen.getByLabelText(/Connected Patient/i);
      fireEvent.change(select, { target: { value: 'patient-789' } });

      // Click Continue to step 2
      fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

      await waitFor(() => {
        expect(screen.getByText('Step 2: Purpose & Rationale')).toBeInTheDocument();
      });
    });

    it('displays patient connection prompt when doctor has no connected patients yet', async () => {
      (doctorApi.getDoctorAssignedPatients as jest.Mock).mockResolvedValue([]);
      const handleOpenConnect = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <RequestConsentModal
            isOpen={true}
            onClose={jest.fn()}
            onOpenConnectPatient={handleOpenConnect}
          />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByText('No Connected Patients in Your Clinical Roster'),
        ).toBeInTheDocument();
      });

      // Verify NO raw UUID input is rendered
      expect(screen.queryByPlaceholderText(/Paste patient UUID/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Patient User UUID/i)).not.toBeInTheDocument();

      // Verify "Invite Patient by Email" button is available
      const inviteBtn = screen.getByRole('button', { name: /Invite Patient by Email/i });
      expect(inviteBtn).toBeInTheDocument();
      fireEvent.click(inviteBtn);
      expect(handleOpenConnect).toHaveBeenCalled();
    });
  });
});
