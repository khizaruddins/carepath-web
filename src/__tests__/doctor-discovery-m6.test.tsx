import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DoctorDiscoveryPage from '@/app/app/doctors/page';
import MyDoctorsPage from '@/app/app/doctors/my-doctors/page';
import DoctorSearchHistoryPage from '@/app/app/doctors/history/page';
import { DoctorCard } from '@/components/doctor/DoctorCard';
import { DoctorFilters } from '@/components/doctor/DoctorFilters';
import { ConnectDoctorModal } from '@/components/doctor/ConnectDoctorModal';
import { ReconnectDoctorModal } from '@/components/doctor/ReconnectDoctorModal';
import { DisconnectDoctorModal } from '@/components/doctor/DisconnectDoctorModal';
import { BlockDoctorModal } from '@/components/doctor/BlockDoctorModal';
import { doctorApi } from '@/lib/api/doctor';
import { DiscoveredDoctorItem, ConnectedDoctorItem, PreviouslyConsultedDoctorItem } from '@/lib/api/types';

jest.mock('@/lib/api/doctor', () => ({
  doctorApi: {
    searchDoctors: jest.fn(),
    getDoctorPublicProfile: jest.fn(),
    connectDoctor: jest.fn(),
    reconnectDoctor: jest.fn(),
    disconnectDoctor: jest.fn(),
    blockDoctor: jest.fn(),
    unblockDoctor: jest.fn(),
    getPatientDoctors: jest.fn(),
    getPatientRelationshipHistory: jest.fn(),
    getPreviouslyConsultedDoctors: jest.fn(),
    getPatientSearchHistory: jest.fn(),
    deleteSearchHistoryItem: jest.fn(),
    clearAllSearchHistory: jest.fn(),
    getDoctorConnectedPatients: jest.fn(),
    getDoctorPracticeLocations: jest.fn(),
    createDoctorPracticeLocation: jest.fn(),
    updateDoctorPracticeLocation: jest.fn(),
    deleteDoctorPracticeLocation: jest.fn(),
    getDoctorAssignedPatients: jest.fn(),
  },
}));

jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: 'patient-user-1',
      email: 'patient@carepath.io',
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
  usePathname: () => '/app/doctors',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
  useParams: () => ({
    doctorId: 'doc-uuid-1',
  }),
}));

const mockDiscoveredDoctor: DiscoveredDoctorItem = {
  id: 'doc-uuid-1',
  fullName: 'Dr. Ramesh Sharma',
  specialization: 'Cardiology',
  subSpecialty: 'Interventional Cardiology',
  qualifications: 'MBBS, MD, DM (Cardiology)',
  yearsOfExperience: 16,
  languages: ['English', 'Hindi'],
  gender: 'MALE',
  clinicName: 'Apollo Heart Clinic',
  clinicAddress: '12 Bannerghatta Road',
  city: 'Bengaluru',
  consultationMode: 'BOTH',
  consultationFee: '800',
  distanceKm: 2.4,
  practiceLocations: [
    {
      id: 'loc-1',
      doctorId: 'doc-uuid-1',
      practiceName: 'Apollo Heart Clinic',
      addressLine1: '12 Bannerghatta Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560076',
      consultationFee: 800,
      isPrimary: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
  isVerified: true,
  relationshipStatus: null,
  isConnected: false,
};

describe('Milestone M6 — Doctor Discovery & Relationship Network', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: 0 },
      },
    });
    jest.clearAllMocks();
  });

  describe('DoctorCard Component', () => {
    it('renders doctor details, verification badge, distance, and connect button', () => {
      const onConnectMock = jest.fn();

      render(
        <DoctorCard
          doctor={mockDiscoveredDoctor}
          onConnect={onConnectMock}
        />,
      );

      expect(screen.getByText('Dr. Ramesh Sharma')).toBeInTheDocument();
      expect(screen.getAllByText(/Cardiology/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Interventional Cardiology/i)).toBeInTheDocument();
      expect(screen.getByText(/16 years experience/i)).toBeInTheDocument();
      expect(screen.getByText(/English · Hindi/i)).toBeInTheDocument();
      expect(screen.getByText(/Apollo Heart Clinic/i)).toBeInTheDocument();
      expect(screen.getByText(/2.4 km away/i)).toBeInTheDocument();
      expect(screen.getByText('800')).toBeInTheDocument();

      const connectBtn = screen.getByRole('button', { name: /^Connect$/i });
      expect(connectBtn).toBeInTheDocument();
      fireEvent.click(connectBtn);
      expect(onConnectMock).toHaveBeenCalledWith(mockDiscoveredDoctor);
    });

    it('renders Connected status badge when doctor is actively connected', () => {
      const connectedDoctor: DiscoveredDoctorItem = {
        ...mockDiscoveredDoctor,
        relationshipStatus: 'ACTIVE',
        isConnected: true,
      };

      render(<DoctorCard doctor={connectedDoctor} />);

      expect(screen.getByText('Connected')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /View Profile/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^Connect$/i })).not.toBeInTheDocument();
    });

    it('renders Previously Connected badge and Reconnect button when status is INACTIVE', () => {
      const inactiveDoctor: DiscoveredDoctorItem = {
        ...mockDiscoveredDoctor,
        relationshipStatus: 'INACTIVE',
        isConnected: false,
      };
      const onReconnectMock = jest.fn();

      render(
        <DoctorCard
          doctor={inactiveDoctor}
          onReconnect={onReconnectMock}
        />,
      );

      expect(screen.getByText(/Previously connected/i)).toBeInTheDocument();
      const reconnectBtn = screen.getByRole('button', { name: /Reconnect/i });
      expect(reconnectBtn).toBeInTheDocument();
      fireEvent.click(reconnectBtn);
      expect(onReconnectMock).toHaveBeenCalledWith(inactiveDoctor);
    });
  });

  describe('ConnectDoctorModal & Architectural Disclaimers', () => {
    it('displays explicit disclaimer that connecting does NOT automatically grant medical vault access', () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ConnectDoctorModal
            isOpen={true}
            doctorId="doc-uuid-1"
            doctorName="Dr. Ramesh Sharma"
            onClose={jest.fn()}
          />
        </QueryClientProvider>,
      );

      expect(screen.getByText(/Connect with Dr. Ramesh Sharma/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Connecting allows you to establish a CarePath relationship with this doctor/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/It does not automatically give the doctor access to your medical records/i),
      ).toBeInTheDocument();
    });

    it('submits connection with SEARCH source and optional notes', async () => {
      (doctorApi.connectDoctor as jest.Mock).mockResolvedValue({
        id: 'rel-1',
        status: 'ACTIVE',
      });
      const handleSuccess = jest.fn();
      const handleClose = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <ConnectDoctorModal
            isOpen={true}
            doctorId="doc-uuid-1"
            doctorName="Dr. Ramesh Sharma"
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </QueryClientProvider>,
      );

      const notesInput = screen.getByPlaceholderText(/Recommended by family physician/i);
      fireEvent.change(notesInput, { target: { value: 'Looking for cardiologist consultation' } });

      const submitBtn = screen.getByRole('button', { name: /Connect with Doctor/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(doctorApi.connectDoctor).toHaveBeenCalledWith('doc-uuid-1', {
          source: 'SEARCH',
          notes: 'Looking for cardiologist consultation',
        });
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('DisconnectDoctorModal & Record Preservation Assurance', () => {
    it('assures patient that historical clinical records remain permanently preserved', async () => {
      (doctorApi.disconnectDoctor as jest.Mock).mockResolvedValue({
        id: 'rel-1',
        status: 'INACTIVE',
      });
      const handleSuccess = jest.fn();

      render(
        <QueryClientProvider client={queryClient}>
          <DisconnectDoctorModal
            isOpen={true}
            doctorId="doc-uuid-1"
            doctorName="Dr. Ramesh Sharma"
            onClose={jest.fn()}
            onSuccess={handleSuccess}
          />
        </QueryClientProvider>,
      );

      expect(screen.getByText(/End relationship with Dr. Ramesh Sharma\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Clinical History Is Preserved/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Your previous consultations, reports and relationship history are not deleted/i),
      ).toBeInTheDocument();

      const reasonInput = screen.getByPlaceholderText(/Treatment completed, relocated/i);
      fireEvent.change(reasonInput, { target: { value: 'Treatment finished' } });

      const confirmBtn = screen.getByRole('button', { name: /End Relationship/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(doctorApi.disconnectDoctor).toHaveBeenCalledWith('doc-uuid-1', {
          reason: 'Treatment finished',
        });
        expect(handleSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('DoctorDiscoveryPage (/app/doctors)', () => {
    it('renders search bar, previous doctors section, and verified doctors', async () => {
      const prevConsultedDoctor: DiscoveredDoctorItem = {
        ...mockDiscoveredDoctor,
        id: 'doc-prev-1',
        fullName: 'Dr. Anita Desai',
        specialization: 'Pediatrics',
        isPreviouslyConsulted: true,
      };

      (doctorApi.searchDoctors as jest.Mock).mockResolvedValue({
        doctors: [prevConsultedDoctor, mockDiscoveredDoctor],
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });

      (doctorApi.getPreviouslyConsultedDoctors as jest.Mock).mockResolvedValue([]);
      (doctorApi.getPatientDoctors as jest.Mock).mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <DoctorDiscoveryPage />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText('Find a Doctor')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Search doctor, specialty or clinic/i)).toBeInTheDocument();
        expect(screen.getByText(/Your previous doctors/i)).toBeInTheDocument();
        expect(screen.getByText('Dr. Anita Desai')).toBeInTheDocument();
        expect(screen.getByText('Dr. Ramesh Sharma')).toBeInTheDocument();
      });
    });

    it('renders empty state when search finds no verified doctors', async () => {
      (doctorApi.searchDoctors as jest.Mock).mockResolvedValue({
        doctors: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
      (doctorApi.getPreviouslyConsultedDoctors as jest.Mock).mockResolvedValue([]);
      (doctorApi.getPatientDoctors as jest.Mock).mockResolvedValue([]);

      render(
        <QueryClientProvider client={queryClient}>
          <DoctorDiscoveryPage />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/No verified doctors match your search/i)).toBeInTheDocument();
      });
    });
  });

  describe('MyDoctorsPage (/app/doctors/my-doctors)', () => {
    it('supports tab switching between Active, Previously Connected, and Previously Consulted', async () => {
      const activeItem: ConnectedDoctorItem = {
        id: 'rel-1',
        relationshipId: 'rel-1',
        doctorId: 'doc-uuid-1',
        status: 'ACTIVE',
        connectedAt: '2026-01-15T00:00:00Z',
        lastInteractionAt: '2026-03-01T00:00:00Z',
        connectionSource: 'DISCOVERY',
        consultationCount: 1,
        doctor: {
          id: 'doc-uuid-1',
          fullName: 'Dr. Ramesh Sharma',
          specialization: 'Cardiology',
          languages: ['English'],
          yearsOfExperience: 16,
          city: 'Bengaluru',
          clinicName: 'Apollo Heart Clinic',
          practiceLocations: [],
        },
      } as any;

      const inactiveItem: ConnectedDoctorItem = {
        id: 'rel-2',
        relationshipId: 'rel-2',
        doctorId: 'doc-uuid-2',
        status: 'INACTIVE',
        connectedAt: '2025-06-01T00:00:00Z',
        disconnectedAt: '2025-12-01T00:00:00Z',
        lastInteractionAt: '2025-12-01T00:00:00Z',
        connectionSource: 'INVITATION',
        consultationCount: 4,
        doctor: {
          id: 'doc-uuid-2',
          fullName: 'Dr. Priya Mehta',
          specialization: 'Dermatology',
          languages: ['English', 'Hindi'],
          yearsOfExperience: 10,
          city: 'Mumbai',
          clinicName: 'Mehta Skin Clinic',
          practiceLocations: [],
        },
      } as any;

      const consultedItem: PreviouslyConsultedDoctorItem = {
        doctorId: 'doc-uuid-3',
        doctorName: 'Dr. Vikram Seth',
        specialization: 'Orthopedics',
        city: 'Bengaluru',
        consultationCount: 3,
        firstConsultationAt: '2025-01-01T00:00:00Z',
        lastConsultationAt: '2025-10-10T00:00:00Z',
        relationshipStatus: null,
        isConnected: false,
      };

      (doctorApi.getPatientDoctors as jest.Mock).mockResolvedValue([activeItem, inactiveItem]);
      (doctorApi.getPreviouslyConsultedDoctors as jest.Mock).mockResolvedValue([consultedItem]);

      render(
        <QueryClientProvider client={queryClient}>
          <MyDoctorsPage />
        </QueryClientProvider>,
      );

      // Default Active tab shows Dr. Ramesh Sharma
      await waitFor(() => {
        expect(screen.getByText('Dr. Ramesh Sharma')).toBeInTheDocument();
        expect(screen.getByText('Cardiology')).toBeInTheDocument();
      });

      // Switch to Inactive tab
      const inactiveTab = screen.getByRole('button', { name: /Previously Connected/i });
      fireEvent.click(inactiveTab);

      await waitFor(() => {
        expect(screen.getByText('Dr. Priya Mehta')).toBeInTheDocument();
        expect(screen.getByText('Dermatology')).toBeInTheDocument();
      });

      // Switch to Consulted tab
      const consultedTab = screen.getByRole('button', { name: /Previously Consulted/i });
      fireEvent.click(consultedTab);

      await waitFor(() => {
        expect(screen.getByText('Dr. Vikram Seth')).toBeInTheDocument();
        expect(screen.getByText(/3 consultations/i)).toBeInTheDocument();
      });
    });
  });

  describe('DoctorSearchHistoryPage (/app/doctors/history)', () => {
    it('renders search history items and clears all history', async () => {
      (doctorApi.getPatientSearchHistory as jest.Mock).mockResolvedValue([
        {
          id: 'hist-1',
          patientId: 'patient-user-1',
          searchQuery: 'Cardiologist in Bengaluru',
          doctorId: null,
          searchedAt: '2026-03-01T10:00:00Z',
        },
        {
          id: 'hist-2',
          patientId: 'patient-user-1',
          searchQuery: null,
          doctorId: 'doc-uuid-1',
          searchedAt: '2026-03-02T12:00:00Z',
          doctor: {
            id: 'doc-uuid-1',
            doctorProfile: {
              fullName: 'Dr. Ramesh Sharma',
              specialization: 'Cardiology',
            },
          },
        },
      ]);
      (doctorApi.clearAllSearchHistory as jest.Mock).mockResolvedValue({ count: 2 });

      render(
        <QueryClientProvider client={queryClient}>
          <DoctorSearchHistoryPage />
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Doctor Search & Profile History/i)).toBeInTheDocument();
        expect(screen.getByText('Cardiologist in Bengaluru')).toBeInTheDocument();
        expect(screen.getByText('Dr. Ramesh Sharma')).toBeInTheDocument();
      });

      const clearBtn = screen.getByRole('button', { name: /Clear All History/i });
      fireEvent.click(clearBtn);

      await waitFor(() => {
        expect(doctorApi.clearAllSearchHistory).toHaveBeenCalled();
      });
    });
  });
});
