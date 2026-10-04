import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TimelineContainer } from '@/components/timeline/TimelineContainer';
import { timelineApi } from '@/lib/api/timeline';
import { TimelineEventItem, TimelineResponse, TimelineEventDetails } from '@/lib/api/types';
import { AuthProvider } from '@/lib/auth-context';

// Mock timelineApi
jest.mock('@/lib/api/timeline', () => ({
  timelineApi: {
    getMyTimeline: jest.fn(),
    getPatientTimeline: jest.fn(),
    getTimelineEventDetails: jest.fn(),
  },
}));

// Mock auth context
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'patient-1', email: 'patient@carepath.io', role: 'PATIENT' },
    isAuthenticated: true,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/app/timeline',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: 'patient-1' }),
}));

describe('Healthcare Timeline 2.0 (M4)', () => {
  let queryClient: QueryClient;

  const mockEvents: TimelineEventItem[] = [
    {
      id: 'event-1',
      patientId: 'patient-1',
      eventType: 'DOCUMENT',
      eventDate: '2026-10-03T10:00:00.000Z',
      datePrecision: 'DAY',
      title: 'Complete Blood Count (CBC)',
      summary: 'Lab Report record at City Diagnostics. Provider: Dr. Pathologist.',
      source: { type: 'DOCUMENT', id: 'doc-cbc-1' },
      providerName: 'Dr. Pathologist',
      visibility: 'SHARED',
      grouping: {
        year: 2026,
        month: 10,
        monthLabel: 'October 2026',
        dayLabel: '2026-10-03',
      },
      metadata: { category: 'LAB_REPORT', facility: 'City Diagnostics' },
      createdAt: '2026-10-03T10:00:00.000Z',
    },
    {
      id: 'event-2',
      patientId: 'patient-1',
      eventType: 'CONSULTATION',
      eventDate: '2026-10-01T14:30:00.000Z',
      datePrecision: 'DAY',
      title: 'Cardiology Consultation',
      summary: 'Routine hypertension follow-up consultation with Dr. Ahmed Khan.',
      source: { type: 'CONSULTATION', id: 'consult-1' },
      providerName: 'Dr. Ahmed Khan',
      visibility: 'SHARED',
      grouping: {
        year: 2026,
        month: 10,
        monthLabel: 'October 2026',
        dayLabel: '2026-10-01',
      },
      metadata: { specialty: 'Cardiology' },
      createdAt: '2026-10-01T14:30:00.000Z',
    },
    {
      id: 'event-3',
      patientId: 'patient-1',
      eventType: 'DOCUMENT',
      eventDate: '2026-09-15T00:00:00.000Z',
      datePrecision: 'MONTH', // Month precision test
      title: 'Historical Chest Radiography',
      summary: 'Historical chest imaging from provincial hospital archive.',
      source: { type: 'DOCUMENT', id: 'doc-img-1' },
      providerName: 'Dr. Radiologist',
      visibility: 'SHARED',
      grouping: {
        year: 2026,
        month: 9,
        monthLabel: 'September 2026',
        dayLabel: '2026-09-15',
      },
      metadata: { category: 'IMAGING_REPORT' },
      createdAt: '2026-09-15T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  // 1. Loading & Initial Chronological Feed
  test('renders timeline header, chronological month groupings, and event cards', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockResolvedValue({
      items: mockEvents,
      total: 3,
      hasMore: false,
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    // Verify Header
    expect(screen.getByText('Health Timeline')).toBeInTheDocument();
    expect(screen.getByText('Your healthcare history in one place.')).toBeInTheDocument();

    // Verify Factual summary stats
    await waitFor(() => {
      expect(screen.getByText('3 events')).toBeInTheDocument();
    });

    // Verify Month Section Headers
    expect(screen.getByText('October 2026')).toBeInTheDocument();
    expect(screen.getByText('September 2026')).toBeInTheDocument();

    // Verify Event Titles
    expect(screen.getByText('Complete Blood Count (CBC)')).toBeInTheDocument();
    expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
    expect(screen.getByText('Historical Chest Radiography')).toBeInTheDocument();
  });

  // 2. Date Precision Verification (M4 Rule 6)
  test('strictly respects date precision: shows month-only label when precision is MONTH', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockResolvedValue({
      items: [mockEvents[2]], // MONTH precision event: '2026-09-15T00:00:00.000Z'
      total: 1,
      hasMore: false,
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Historical Chest Radiography')).toBeInTheDocument();
    });

    // Precision is MONTH: Should display "Sep 2026", NOT "15 Sep 2026" or "01 Sep 2026"
    expect(screen.getAllByText('Sep 2026').length).toBeGreaterThan(0);
    expect(screen.queryByText('15 Sep 2026')).not.toBeInTheDocument();
    expect(screen.queryByText('01 Sep 2026')).not.toBeInTheDocument();
  });

  // 3. Search & Event Type Filtering
  test('filters timeline events by search keyword and event type', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockResolvedValue({
      items: mockEvents,
      total: 3,
      hasMore: false,
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count (CBC)')).toBeInTheDocument();
    });

    // Enter search keyword
    const searchInput = screen.getByPlaceholderText('Search records, tests, doctors...');
    fireEvent.change(searchInput, { target: { value: 'CBC' } });

    // Expect API called with search param
    await waitFor(() => {
      expect(timelineApi.getMyTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'CBC' }),
      );
    });

    // Change Event Type Select
    const typeSelect = screen.getByDisplayValue('All Event Types');
    fireEvent.change(typeSelect, { target: { value: 'CONSULTATION' } });

    await waitFor(() => {
      expect(timelineApi.getMyTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ eventType: 'CONSULTATION' }),
      );
    });
  });

  // 4. Cursor Pagination ("Load older records")
  test('handles cursor pagination via Load older records button', async () => {
    (timelineApi.getMyTimeline as jest.Mock)
      .mockResolvedValueOnce({
        items: [mockEvents[0]],
        total: 3,
        hasMore: true,
        nextCursor: 'cursor-page-2',
      })
      .mockResolvedValueOnce({
        items: [mockEvents[1], mockEvents[2]],
        total: 3,
        hasMore: false,
        nextCursor: null,
      });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Complete Blood Count (CBC)')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /load older records/i });
    expect(loadMoreButton).toBeInTheDocument();

    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(timelineApi.getMyTimeline).toHaveBeenCalledWith(
        expect.objectContaining({ cursor: 'cursor-page-2' }),
      );
    });
  });

  // 5. Source Record Detail Modal (Opening on-demand source record)
  test('opens source record detail modal when clicking action button', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockResolvedValue({
      items: [mockEvents[1]], // Consultation event
      total: 1,
      hasMore: false,
      nextCursor: null,
    });

    const mockDetails: TimelineEventDetails = {
      event: mockEvents[1],
      resolvedSource: {
        sourceType: 'CONSULTATION',
        sourceId: 'consult-1',
        sourceData: {
          id: 'consult-1',
          consultationDate: '2026-10-01T14:30:00.000Z',
          reasonForVisit: 'Hypertension Follow-up',
          chiefComplaint: 'Mild headaches in the morning',
          assessment: 'Stage 1 Hypertension well controlled on current therapy',
          plan: 'Continue Amlodipine 5mg daily. Low sodium diet.',
          followUpInstructions: 'Return in 3 months for blood pressure review.',
        },
      },
    };

    (timelineApi.getTimelineEventDetails as jest.Mock).mockResolvedValue(mockDetails);

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Cardiology Consultation')).toBeInTheDocument();
    });

    const viewButton = screen.getByRole('button', {
      name: /view consultation: cardiology consultation/i,
    });
    fireEvent.click(viewButton);

    // Modal opens and shows resolved clinical notes
    await waitFor(() => {
      expect(screen.getByText('Original medical record • Consultation')).toBeInTheDocument();
      expect(screen.getByText('Mild headaches in the morning')).toBeInTheDocument();
      expect(screen.getByText('Stage 1 Hypertension well controlled on current therapy')).toBeInTheDocument();
      expect(screen.getByText('Return in 3 months for blood pressure review.')).toBeInTheDocument();
    });
  });

  // 6. Doctor View with M3 Authorization Notice
  test('renders doctor authorization notice and queries patient timeline endpoint in doctor view', async () => {
    (timelineApi.getPatientTimeline as jest.Mock).mockResolvedValue({
      items: [mockEvents[0]],
      total: 1,
      hasMore: false,
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer
          patientId="patient-1"
          isDoctorView={true}
          patientName="Rahul Sharma"
          consentExpiresAt="2026-10-31T23:59:59.000Z"
        />
      </QueryClientProvider>,
    );

    // Verify Doctor Notice is displayed
    expect(screen.getByText(/authorized clinical timeline view for rahul sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/showing records you currently have permission to access under active patient consent/i)).toBeInTheDocument();
    expect(screen.getByText('Access expires')).toBeInTheDocument();

    await waitFor(() => {
      expect(timelineApi.getPatientTimeline).toHaveBeenCalledWith(
        'patient-1',
        expect.any(Object),
      );
    });
  });

  // 7. Empty State with Upload Action
  test('renders calm empty state with Upload a health record CTA when timeline is empty', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockResolvedValue({
      items: [],
      total: 0,
      hasMore: false,
      nextCursor: null,
    });

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Your timeline is empty')).toBeInTheDocument();
      expect(screen.getByText(/they’ll appear here chronologically/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /upload a health record/i })).toBeInTheDocument();
    });
  });

  // 8. Error State with Retry Action
  test('renders helpful error state and supports retry without claiming data loss', async () => {
    (timelineApi.getMyTimeline as jest.Mock).mockRejectedValue(new Error('Network connectivity issue'));

    render(
      <QueryClientProvider client={queryClient}>
        <TimelineContainer isDoctorView={false} />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("We couldn't load your timeline")).toBeInTheDocument();
      expect(screen.getByText(/your health records are safe/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });
});
