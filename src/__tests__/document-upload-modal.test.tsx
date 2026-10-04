import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentUploadModal } from '@/components/documents/DocumentUploadModal';
import { documentsApi } from '@/lib/api/documents';

// Mock documentsApi
jest.mock('@/lib/api/documents', () => ({
  documentsApi: {
    uploadDocument: jest.fn(),
    updateDocument: jest.fn(),
  },
}));

describe('DocumentUploadModal Workflow', () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<DocumentUploadModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByText(/upload medical document/i)).toBeInTheDocument();
    expect(screen.getByText(/click or drag file to upload/i)).toBeInTheDocument();
  });

  it('disables submit button when no file is selected', () => {
    render(<DocumentUploadModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);
    
    const submitBtn = screen.getByRole('button', { name: /upload & process/i });
    expect(submitBtn).toBeDisabled();
    expect(documentsApi.uploadDocument).not.toHaveBeenCalled();
  });

  it('supports selecting different document categories', () => {
    render(<DocumentUploadModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />);
    const select = screen.getByLabelText(/document category/i) as HTMLSelectElement;
    expect(select.value).toBe('LAB_REPORT');

    fireEvent.change(select, { target: { value: 'PRESCRIPTION' } });
    expect(select.value).toBe('PRESCRIPTION');
  });

  it('calls upload API and allows patient to confirm extracted metadata', async () => {
    const mockUploadedDoc = {
      id: 'doc-123',
      patientId: 'patient-456',
      originalName: 'blood-test.pdf',
      mimeType: 'application/pdf',
      fileSizeBytes: 10240,
      category: 'LAB_REPORT',
      status: 'PENDING_REVIEW',
      ocrStatus: 'COMPLETED',
      ocrExtractedData: {
        rawText: 'Fasting Blood Glucose: 92 mg/dL. HbA1c: 5.4%',
        confidence: 0.96,
        detectedType: 'LAB_REPORT',
        detectedDate: '2026-10-01',
      },
      metadata: {
        reportTitle: 'Complete Blood Count',
        providerName: 'Dr. Sarah Smith',
        facility: 'Metropolitan Health Center',
        documentDate: '2026-10-01T00:00:00.000Z',
      },
      currentVersion: 1,
      createdAt: '2026-10-03T10:00:00.000Z',
      updatedAt: '2026-10-03T10:00:00.000Z',
    };

    (documentsApi.uploadDocument as jest.Mock).mockResolvedValue({
      message: 'Document uploaded successfully',
      document: mockUploadedDoc,
    });

    (documentsApi.updateDocument as jest.Mock).mockResolvedValue({
      message: 'Document updated successfully',
      metadata: mockUploadedDoc.metadata,
    });

    const { container } = render(
      <DocumentUploadModal isOpen={true} onClose={onClose} onSuccess={onSuccess} />
    );

    // Simulate file input
    const file = new File(['mock content'], 'blood-test.pdf', { type: 'application/pdf' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(input, 'files', {
      value: [file],
    });
    fireEvent.change(input);

    expect(screen.getByDisplayValue('blood test')).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /upload & process/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(documentsApi.uploadDocument).toHaveBeenCalledTimes(1);
    });

    // Should transition to review step showing extracted metadata
    await waitFor(() => {
      expect(screen.getByText('Extracted Document Details')).toBeInTheDocument();
      expect(screen.getByText('Complete Blood Count')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm & save record/i })).toBeInTheDocument();
    });

    // Patient confirms metadata
    fireEvent.click(screen.getByRole('button', { name: /confirm & save record/i }));

    await waitFor(() => {
      expect(documentsApi.updateDocument).toHaveBeenCalledWith(
        'doc-123',
        expect.objectContaining({
          isPatientConfirmed: true,
        })
      );
    });
  });
});
