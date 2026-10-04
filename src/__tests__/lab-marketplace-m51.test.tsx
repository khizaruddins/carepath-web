import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PatientInvestigationsPage from '@/app/app/investigations/page';
import InvestigationDetailPage from '@/app/app/investigations/[id]/page';
import InvestigationLabDiscoveryPage from '@/app/app/investigations/[id]/labs/page';
import { TemporaryClinicalAccessCard } from '@/components/lab/TemporaryClinicalAccessCard';
import { LabAccessBanner } from '@/components/lab/LabAccessBanner';
import { LabComparisonModal } from '@/components/lab/LabComparisonModal';
import { LabSelectionConfirmModal } from '@/components/lab/LabSelectionConfirmModal';
import { ShareReportModal } from '@/components/lab/ShareReportModal';
import { labApi } from '@/lib/api/lab';
import { DiscoveredLabItem, LabCareConnection } from '@/lib/api/types';

jest.mock('@/lib/api/lab', () => ({
  labApi: {
    getPatientInvestigations: jest.fn(),
    getInvestigationById: jest.fn(),
    compareLabsForInvestigation: jest.fn(),
    selectLabForInvestigation: jest.fn(),
    getLabCareConnection: jest.fn(),
    getLabCareConnectionByOrder: jest.fn(),
    revokeLabCareConnection: jest.fn(),
    shareReportWithDoctor: jest.fn(),
    listCanonicalTests: jest.fn(),
    getLabProfile: jest.fn(),
    listLabLocations: jest.fn(),
    listLabTests: jest.fn(),
  },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'patient-user-1',
      email: 'patient@example.com',
      role: 'PATIENT',
      status: 'ACTIVE',
    },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/app/investigations',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  useParams: () => ({
    id: 'inv-101',
    labId: 'lab-facility-1',
  }),
}));

describe('CarePath M5.1 — Lab Discovery & Clinical Connections', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const mockInvestigation = {
    id: 'inv-101',
    patientId: 'patient-user-1',
    doctorId: 'doctor-user-1',
    testName: 'Complete Blood Count (CBC)',
    status: 'REQUESTED' as const,
    priority: 'ROUTINE',
    clinicalReason: 'Evaluate persistent fatigue and mild pallor',
    instructions: '10-12 hours overnight fasting recommended',
    createdAt: new Date().toISOString(),
    doctor: {
      id: 'doctor-user-1',
      specialty: 'Internal Medicine',
      user: {
        id: 'u-doc-1',
        email: 'dr.sharma@carepath.example.com',
        profile: {
          fullName: 'Ananya Sharma',
        },
      },
    },
  };

  const mockDiscoveredLabs: DiscoveredLabItem[] = [
    {
      lab: {
        id: 'lab-alpha',
        name: 'Apex Diagnostic Center',
        licenseNumber: 'LIC-NABL-001',
        verificationStatus: 'VERIFIED',
        contactEmail: 'contact@apex.example.com',
        contactPhone: '+91 98765 43210',
        city: 'Mumbai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      location: {
        id: 'loc-1',
        labId: 'lab-alpha',
        branchName: 'Andheri West Main Hub',
        address: '101 SV Road, Andheri West',
        city: 'Mumbai',
        pincode: '400058',
        latitude: 19.1136,
        longitude: 72.8697,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      distanceKm: 2.4,
      tat: '6-8 hours',
      isHomeCollectionAvailable: true,
      pricing: {
        testPrice: 450,
        homeCollectionFee: 100,
        totalPrice: 550,
        currency: 'INR',
        isAccredited: true,
      },
      sampleTypes: ['Whole Blood EDTA'],
      matchScore: 92,
    },
    {
      lab: {
        id: 'lab-beta',
        name: 'Metropolis Care Labs',
        licenseNumber: 'LIC-CAP-002',
        verificationStatus: 'VERIFIED',
        contactEmail: 'info@metropolis.example.com',
        contactPhone: '+91 98765 43211',
        city: 'Mumbai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      location: {
        id: 'loc-2',
        labId: 'lab-beta',
        branchName: 'Bandra Center',
        address: 'Hill Road, Bandra West',
        city: 'Mumbai',
        pincode: '400050',
        latitude: 19.0596,
        longitude: 72.8295,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      distanceKm: 5.1,
      tat: '12 hours',
      isHomeCollectionAvailable: false,
      pricing: {
        testPrice: 380,
        homeCollectionFee: 0,
        totalPrice: 380,
        currency: 'INR',
        isAccredited: true,
      },
      sampleTypes: ['Whole Blood EDTA'],
      matchScore: 88,
    },
  ];

  const mockActiveConnection: LabCareConnection = {
    id: 'conn-101',
    orderId: 'order-101',
    labId: 'lab-alpha',
    patientId: 'patient-user-1',
    prescribedDoctorId: 'doctor-user-1',
    status: 'ACTIVE',
    accessScope: 'MINIMUM_CLINICAL_CONTEXT',
    expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    lab: mockDiscoveredLabs[0].lab,
  };

  test('1. PatientInvestigationsPage renders list of investigations with action badge', async () => {
    (labApi.getPatientInvestigations as jest.Mock).mockResolvedValueOnce([mockInvestigation]);

    render(
      <QueryClientProvider client={queryClient}>
        <PatientInvestigationsPage />
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { name: /Medical Investigations/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getAllByText('Complete Blood Count (CBC)')[0]).toBeInTheDocument();
      expect(screen.getByText(/Dr. Ananya Sharma/i)).toBeInTheDocument();
      expect(screen.getByText(/Action Needed: Choose Lab/i)).toBeInTheDocument();
      expect(screen.getByText(/Find & Compare Labs/i)).toBeInTheDocument();
    });
  });

  test('2. InvestigationDetailPage renders clinical details and lab booking action', async () => {
    (labApi.getInvestigationById as jest.Mock).mockResolvedValueOnce(mockInvestigation);
    (labApi.getLabCareConnectionByOrder as jest.Mock).mockResolvedValueOnce(null);

    render(
      <QueryClientProvider client={queryClient}>
        <InvestigationDetailPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count (CBC)')).toBeInTheDocument();
      expect(screen.getByText(/Evaluate persistent fatigue/i)).toBeInTheDocument();
      expect(screen.getByText(/10-12 hours overnight fasting/i)).toBeInTheDocument();
      expect(screen.getByText('Select Diagnostic Lab')).toBeInTheDocument();
    });
  });

  test('3. InvestigationLabDiscoveryPage renders discovered labs with distance, price, and TAT', async () => {
    (labApi.getInvestigationById as jest.Mock).mockResolvedValueOnce(mockInvestigation);
    (labApi.compareLabsForInvestigation as jest.Mock).mockResolvedValueOnce({
      investigationId: 'inv-101',
      labs: mockDiscoveredLabs,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <InvestigationLabDiscoveryPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Diagnostic Labs for Complete Blood Count \(CBC\)/i)).toBeInTheDocument();
      expect(screen.getByText('Apex Diagnostic Center')).toBeInTheDocument();
      expect(screen.getByText('Metropolis Care Labs')).toBeInTheDocument();
      expect(screen.getByText('₹450.00')).toBeInTheDocument();
      expect(screen.getByText('₹380.00')).toBeInTheDocument();
      expect(screen.getByText('6-8 hours')).toBeInTheDocument();
    });
  });

  test('4. LabComparisonModal displays side-by-side parameters accurately', () => {
    const handleSelectLab = jest.fn();
    render(
      <LabComparisonModal
        isOpen={true}
        onClose={jest.fn()}
        labs={mockDiscoveredLabs}
        onSelectLab={handleSelectLab}
      />,
    );

    expect(screen.getByText(/Side-by-Side Laboratory Comparison/i)).toBeInTheDocument();
    expect(screen.getByText('Apex Diagnostic Center')).toBeInTheDocument();
    expect(screen.getByText('Metropolis Care Labs')).toBeInTheDocument();
    expect(screen.getByText('Available (+₹100)')).toBeInTheDocument();
    expect(screen.getByText('Center Visit Only')).toBeInTheDocument();

    const chooseButtons = screen.getAllByText('Choose Lab');
    expect(chooseButtons.length).toBe(2);
    fireEvent.click(chooseButtons[0]);
    expect(handleSelectLab).toHaveBeenCalledWith(mockDiscoveredLabs[0]);
  });

  test('5. LabSelectionConfirmModal calculates total price and enforces consent', async () => {
    const handleConfirm = jest.fn().mockResolvedValue(undefined);

    render(
      <LabSelectionConfirmModal
        isOpen={true}
        onClose={jest.fn()}
        labItem={mockDiscoveredLabs[0]}
        investigation={mockInvestigation as any}
        onConfirm={handleConfirm}
      />,
    );

    expect(screen.getByText(/Confirm Diagnostic Center & Clinical Booking/i)).toBeInTheDocument();
    expect(screen.getAllByText('Apex Diagnostic Center')[0]).toBeInTheDocument();
    // Default is FACILITY_VISIT: total = 450
    expect(screen.getAllByText('₹450.00').length).toBeGreaterThan(0);

    // Switch to HOME_COLLECTION
    const homeRadio = screen.getByLabelText(/Home Collection/i);
    fireEvent.click(homeRadio);

    // Total should update to 550
    expect(screen.getByText('₹550.00')).toBeInTheDocument();
    expect(screen.getByText(/Home Collection Address \*/i)).toBeInTheDocument();

    // Fill address
    const addressInput = screen.getByPlaceholderText(/Flat\/House number/i);
    fireEvent.change(addressInput, { target: { value: 'B-202 Palm Grove, Andheri West' } });

    // Submit booking
    const submitBtn = screen.getByText(/Confirm & Create Lab Booking/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          labId: 'lab-alpha',
          collectionMode: 'HOME_COLLECTION',
          collectionAddress: 'B-202 Palm Grove, Andheri West',
        }),
      );
    });
  });

  test('6. TemporaryClinicalAccessCard renders permitted vs restricted scopes & allows early revocation', async () => {
    (labApi.revokeLabCareConnection as jest.Mock).mockResolvedValueOnce({
      message: 'Access revoked',
      connection: { ...mockActiveConnection, status: 'MANUAL_REVOKED' },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TemporaryClinicalAccessCard connection={mockActiveConnection} />
      </QueryClientProvider>,
    );

    expect(screen.getByText('Temporary Clinical Connection')).toBeInTheDocument();
    expect(screen.getByText('Active Temporary Access')).toBeInTheDocument();
    expect(screen.getByText(/Permitted Scopes \(Minimum-Necessary\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Strictly Denied & Vault-Isolated/i)).toBeInTheDocument();
    expect(screen.getByText(/Full Patient Health Vault & Past Documents/i)).toBeInTheDocument();

    // Click Revoke Early
    const revokeBtn = screen.getByText('Revoke Access Early');
    fireEvent.click(revokeBtn);

    expect(screen.getByText('Revoke Laboratory Access')).toBeInTheDocument();
    const confirmBtn = screen.getByText('Confirm Revocation');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(labApi.revokeLabCareConnection).toHaveBeenCalledWith('conn-101', undefined);
    });
  });

  test('7. LabAccessBanner displays active and auto-revoked states for lab view', () => {
    const { rerender } = render(<LabAccessBanner connection={mockActiveConnection} />);
    expect(screen.getByText(/Temporary Clinical Connection Active/i)).toBeInTheDocument();
    expect(screen.getByText(/72h Authorized Window/i)).toBeInTheDocument();

    rerender(
      <LabAccessBanner
        connection={{ ...mockActiveConnection, status: 'AUTO_REVOKED' }}
      />,
    );
    expect(
      screen.getByText(/Clinical Connection Completed & Auto-Revoked/i),
    ).toBeInTheDocument();
  });

  test('8. ShareReportModal grants view-only access to prescribing physician', async () => {
    (labApi.shareReportWithDoctor as jest.Mock).mockResolvedValueOnce({
      message: 'Report shared successfully',
      consent: { id: 'consent-doc-1' },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ShareReportModal
          isOpen={true}
          onClose={jest.fn()}
          reportId="rep-101"
          reportTitle="Complete Blood Count Report"
          prescribedDoctorId="doctor-user-1"
          prescribedDoctorName="Ananya Sharma"
        />
      </QueryClientProvider>,
    );

    expect(screen.getByText(/Share Diagnostic Report with Clinician/i)).toBeInTheDocument();
    expect(screen.getByText(/Dr. Ananya Sharma \(Prescribing Physician\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Strict View-Only Policy/i)).toBeInTheDocument();

    const grantBtn = screen.getByText('Grant View-Only Access');
    fireEvent.click(grantBtn);

    await waitFor(() => {
      expect(labApi.shareReportWithDoctor).toHaveBeenCalledWith('rep-101', {
        doctorId: 'doctor-user-1',
        purpose: 'Diagnostic review and treatment plan evaluation',
        durationDays: 30,
      });
      expect(screen.getByText('Report Successfully Shared')).toBeInTheDocument();
    });
  });
});
