import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';
import { AuthProvider } from '@/lib/auth-context';
import { authApi } from '@/lib/api/auth';

jest.mock('@/lib/api/auth', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn().mockRejectedValue(new Error('No active session')),
    refreshToken: jest.fn(),
  },
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
  }),
  usePathname: () => '/login',
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue(null),
  }),
}));

describe('Authentication Pages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('LoginPage', () => {
    it('renders login form with email and password fields', () => {
      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      expect(screen.getByRole('heading', { name: /sign in to your health vault/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /access health vault/i })).toBeInTheDocument();
    });

    it('submits credentials and routes on successful login', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        user: {
          id: 'user-123',
          email: 'patient@carepath.example.com',
          role: 'PATIENT',
          status: 'ACTIVE',
        },
      });

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'patient@carepath.example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'Password123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /access health vault/i }));

      await waitFor(() => {
        expect(authApi.login).toHaveBeenCalledWith({
          email: 'patient@carepath.example.com',
          password: 'Password123!',
        });
        expect(mockPush).toHaveBeenCalledWith('/app/dashboard');
      });
    });

    it('displays error message when login fails', async () => {
      (authApi.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));

      render(
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'patient@carepath.example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^password/i), {
        target: { value: 'WrongPassword' },
      });

      fireEvent.click(screen.getByRole('button', { name: /access health vault/i }));

      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    it('validates password minimum length requirement', async () => {
      render(
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/full legal name/i), {
        target: { value: 'Jane Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password \(min\. 8 characters\)/i), {
        target: { value: 'short' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create vault account/i }));

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      });
    });

    it('successfully calls register API and redirects', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        user: {
          id: 'user-456',
          email: 'jane@example.com',
          role: 'PATIENT',
          status: 'ACTIVE',
        },
      });

      render(
        <AuthProvider>
          <RegisterPage />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/full legal name/i), {
        target: { value: 'Jane Doe' },
      });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'jane@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/password \(min\. 8 characters\)/i), {
        target: { value: 'SecurePass123!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /create vault account/i }));

      await waitFor(() => {
        expect(authApi.register).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'Jane Doe',
            email: 'jane@example.com',
            password: 'SecurePass123!',
          })
        );
        expect(mockPush).toHaveBeenCalledWith('/app/dashboard');
      });
    });
  });
});
