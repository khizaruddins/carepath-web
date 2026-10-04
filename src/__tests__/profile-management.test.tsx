import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PatientProfilePage from '@/app/app/profile/page';
import { patientsApi } from '@/lib/api/patients';
import { authApi } from '@/lib/api/auth';
import { usersApi } from '@/lib/api/users';
import { AuthProvider } from '@/lib/auth-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('@/lib/api/auth', () => ({
  authApi: {
    getCurrentUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
  },
}));

jest.mock('@/lib/api/users', () => ({
  usersApi: {
    getMe: jest.fn(),
  },
}));

jest.mock('@/lib/api/patients', () => ({
  patientsApi: {
    getMyProfile: jest.fn(),
    updateMyProfile: jest.fn(),
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => '/app/profile',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('Patient Profile Management', () => {
  let queryClient: QueryClient;

  const mockUser = {
    id: 'user-1',
    email: 'eleanor@carepath.example.com',
    role: 'PATIENT' as const,
    status: 'ACTIVE' as const,
  };

  const mockProfile = {
    id: 'profile-1',
    userId: 'user-1',
    fullName: 'Eleanor Vance',
    dateOfBirth: '1988-04-12T00:00:00.000Z',
    gender: 'FEMALE' as const,
    bloodGroup: 'O_POSITIVE' as const,
    city: 'Boston',
    mobile: '+1 555-0192',
    email: 'eleanor@carepath.example.com',
    emergencyContactName: 'Thomas Vance',
    emergencyContactPhone: '+1 555-0192',
    emergencyContactRelation: 'Spouse',
    knownConditions: ['Asthma', 'Mild Hypertension'],
    allergies: ['Penicillin', 'Peanuts'],
    currentMedications: ['Albuterol Inhaler 90mcg', 'Lisinopril 10mg'],
    pastSurgeries: ['Appendectomy (2018)'],
    importantMedicalHistory: 'Regular annual followups. No cardiac events.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem('carepath_access_token', 'mock-valid-token');
    (usersApi.getMe as jest.Mock).mockResolvedValue(mockUser);
    (patientsApi.getMyProfile as jest.Mock).mockResolvedValue(mockProfile);

    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  it('renders patient health profile with demographic form fields', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PatientProfilePage />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /patient health profile/i })).toBeInTheDocument();
      expect(screen.getByDisplayValue('Eleanor Vance')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Boston')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /save profile changes/i })).toBeInTheDocument();
  });

  it('allows updating demographic fields and submitting changes', async () => {
    (patientsApi.updateMyProfile as jest.Mock).mockResolvedValue({
      ...mockProfile,
      city: 'Cambridge',
    });

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PatientProfilePage />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Boston')).toBeInTheDocument();
    });

    const cityInput = screen.getByLabelText(/city \/ locality/i);
    fireEvent.change(cityInput, { target: { value: 'Cambridge' } });

    // Click Save Profile Changes
    fireEvent.click(screen.getByRole('button', { name: /save profile changes/i }));

    await waitFor(() => {
      expect(patientsApi.updateMyProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          city: 'Cambridge',
        })
      );
    });
  });

  it('switches between profile tabs and renders conditions and medications', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <PatientProfilePage />
        </AuthProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('Eleanor Vance')).toBeInTheDocument();
    });

    // Switch to Conditions & Allergies tab
    const conditionsTab = screen.getByRole('button', { name: /conditions & allergies/i });
    fireEvent.click(conditionsTab);

    await waitFor(() => {
      expect(screen.getByText('Asthma')).toBeInTheDocument();
      expect(screen.getByText('Penicillin')).toBeInTheDocument();
    });

    // Switch to Medications & Surgeries tab
    const medsTab = screen.getByRole('button', { name: /medications & surgeries/i });
    fireEvent.click(medsTab);

    await waitFor(() => {
      expect(screen.getByText('Albuterol Inhaler 90mcg')).toBeInTheDocument();
      expect(screen.getByText('Appendectomy (2018)')).toBeInTheDocument();
    });
  });
});
