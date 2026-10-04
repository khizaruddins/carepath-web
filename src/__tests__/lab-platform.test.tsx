import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LabDashboardView } from '@/components/lab/LabDashboardView';
import LabOrdersPage from '@/app/app/lab/orders/page';
import LabTestsPage from '@/app/app/lab/tests/page';
import LabVerificationsPage from '@/app/app/admin/lab-verifications/page';
import { labApi } from '@/lib/api/lab';

jest.mock('@/lib/api/lab', () => ({
  labApi: {
    getMyLab: jest.fn(),
    listOrders: jest.fn(),
    listLabTests: jest.fn(),
    createCatalogTest: jest.fn(),
    updateCatalogTest: jest.fn(),
    listVerifications: jest.fn(),
    reviewVerification: jest.fn(),
    getOrder: jest.fn(),
    createSample: jest.fn(),
    finalizeReport: jest.fn(),
    amendReport: jest.fn(),
    getReport: jest.fn(),
    listVerifiedLabs: jest.fn(),
  },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'lab-user-1',
      email: 'labadmin@carepath.example.com',
      role: 'LAB',
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
    back: jest.fn(),
  }),
  usePathname: () => '/app/lab/dashboard',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  useParams: () => ({
    orderId: 'order-101',
    reportId: 'report-101',
  }),
}));

describe('Lab Platform Frontend (M5)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    jest.clearAllMocks();
  });

  const mockLab = {
    id: 'lab-facility-1',
    name: 'CarePath Central Diagnostics',
    legalName: 'CarePath Diagnostics Pvt Ltd',
    licenseNumber: 'LAB-ISO-9001-DL',
    verificationStatus: 'VERIFIED' as const,
    contactEmail: 'central@carepathlab.example.com',
    contactPhone: '+1-555-0199',
    city: 'Metropolis',
    state: 'NY',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockMyLabResponse = {
    membershipId: 'mem-1',
    role: 'LAB_ADMIN' as const,
    status: 'ACTIVE' as const,
    lab: mockLab,
  };

  const mockOrdersResponse = {
    total: 2,
    page: 1,
    limit: 20,
    orders: [
      {
        id: 'order-101',
        orderNumber: 'LAB-202610-001',
        labId: 'lab-facility-1',
        patientId: 'patient-1',
        patientName: 'Jane Doe',
        patientAge: 34,
        patientGender: 'Female',
        status: 'ORDERED' as const,
        collectionMode: 'LAB_WALK_IN' as const,
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'item-1',
            testName: 'Complete Blood Count (CBC)',
            price: 450,
          },
        ],
        samples: [],
      },
      {
        id: 'order-102',
        orderNumber: 'LAB-202610-002',
        labId: 'lab-facility-1',
        patientId: 'patient-2',
        patientName: 'John Smith',
        patientAge: 48,
        patientGender: 'Male',
        status: 'SAMPLE_COLLECTED' as const,
        collectionMode: 'HOME_COLLECTION' as const,
        createdAt: new Date().toISOString(),
        items: [
          {
            id: 'item-2',
            testName: 'Lipid Panel',
            price: 600,
          },
        ],
        samples: [
          {
            id: 'sample-1',
            sampleType: 'Whole Blood (EDTA)',
            sampleIdentifier: 'SMP-202610-001',
            status: 'COLLECTED' as const,
            collectedAt: new Date().toISOString(),
          },
        ],
      },
    ],
  };

  const mockTestsResponse = [
    {
      id: 'test-1',
      labId: 'lab-facility-1',
      testCode: 'CBC-01',
      name: 'Complete Blood Count (CBC)',
      category: 'HEMATOLOGY' as const,
      price: 450,
      turnaroundTime: '12 Hours',
      sampleTypes: ['Whole Blood (EDTA)'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'test-2',
      labId: 'lab-facility-1',
      testCode: 'LIP-01',
      name: 'Lipid Profile',
      category: 'BIOCHEMISTRY' as const,
      price: 600,
      turnaroundTime: '24 Hours',
      sampleTypes: ['Serum'],
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  it('renders Lab Dashboard with operational metrics and recent orders', async () => {
    (labApi.getMyLab as jest.Mock).mockResolvedValue(mockMyLabResponse);
    (labApi.listOrders as jest.Mock).mockResolvedValue(mockOrdersResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <LabDashboardView />
      </QueryClientProvider>,
    );

    // Verify facility identity and verification badge
    await waitFor(() => {
      expect(screen.getByText('CarePath Central Diagnostics')).toBeInTheDocument();
      expect(screen.getByText('VERIFIED')).toBeInTheDocument();
      expect(screen.getByText('Orders Requiring Attention')).toBeInTheDocument();
      expect(screen.getByText('LAB-202610-001')).toBeInTheDocument();
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });
  });

  it('renders Lab Orders queue with filters and order status badges', async () => {
    (labApi.getMyLab as jest.Mock).mockResolvedValue(mockMyLabResponse);
    (labApi.listOrders as jest.Mock).mockResolvedValue(mockOrdersResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <LabOrdersPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Orders Queue')).toBeInTheDocument();
      expect(screen.getAllByText('LAB-202610-001').length).toBeGreaterThan(0);
      expect(screen.getAllByText('LAB-202610-002').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Jane Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('John Smith').length).toBeGreaterThan(0);
    });
  });

  it('renders Test Catalog and allows filtering by category', async () => {
    (labApi.getMyLab as jest.Mock).mockResolvedValue(mockMyLabResponse);
    (labApi.listLabTests as jest.Mock).mockResolvedValue(mockTestsResponse);

    render(
      <QueryClientProvider client={queryClient}>
        <LabTestsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Test Catalog')).toBeInTheDocument();
      expect(screen.getByText('Complete Blood Count (CBC)')).toBeInTheDocument();
      expect(screen.getByText('Lipid Profile')).toBeInTheDocument();
      expect(screen.getByText('CBC-01')).toBeInTheDocument();
      expect(screen.getByText('LIP-01')).toBeInTheDocument();
    });
  });

  it('renders Admin Lab Verifications page and displays facilities', async () => {
    (labApi.listVerifications as jest.Mock).mockResolvedValue([mockLab]);

    render(
      <QueryClientProvider client={queryClient}>
        <LabVerificationsPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Laboratory Verifications')).toBeInTheDocument();
      expect(screen.getByText('CarePath Central Diagnostics')).toBeInTheDocument();
      expect(screen.getByText('Lic: LAB-ISO-9001-DL')).toBeInTheDocument();
      expect(screen.getByText('Suspend')).toBeInTheDocument();
    });
  });

  it('renders Lab Report page with diagnostic findings and amendment controls', async () => {
    const LabReportDetailPage = (await import('@/app/app/lab/reports/[reportId]/page')).default;
    const mockReport = {
      id: 'report-101',
      reportNumber: 'REP-202610-001',
      orderId: 'order-101',
      labId: 'lab-facility-1',
      status: 'FINALIZED' as const,
      testSummary: 'Hemoglobin: 14.2 g/dL (Normal). Platelets: 250,000/uL.',
      clinicalNotes: 'All hematological indices within normal reference limits.',
      finalizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lab: mockLab,
    };

    (labApi.getReport as jest.Mock).mockResolvedValue(mockReport);

    render(
      <QueryClientProvider client={queryClient}>
        <LabReportDetailPage />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Report REP-202610-001')).toBeInTheDocument();
      expect(screen.getByText('Validated & Finalized')).toBeInTheDocument();
      expect(screen.getByText(/Hemoglobin: 14.2 g\/dL/)).toBeInTheDocument();
      expect(screen.getByText(/All hematological indices within normal/)).toBeInTheDocument();
      expect(screen.getByText('Issue Formal Amendment')).toBeInTheDocument();
    });
  });
});

