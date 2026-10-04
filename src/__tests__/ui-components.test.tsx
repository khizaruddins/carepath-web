import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileText } from 'lucide-react';

describe('Design System UI Components', () => {
  describe('Button', () => {
    it('renders button with children', () => {
      render(<Button>Upload Document</Button>);
      expect(screen.getByRole('button', { name: /upload document/i })).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button', { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading spinner and disables button when isLoading is true', () => {
      render(<Button isLoading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('disabled');
    });

    it('renders with destructive variant for destructive actions', () => {
      render(<Button variant="destructive">Delete Record</Button>);
      const button = screen.getByRole('button', { name: /delete record/i });
      expect(button.className).toContain('bg-rose-700');
    });
  });

  describe('Input', () => {
    it('renders input with label and helper text', () => {
      render(
        <Input
          label="Blood Glucose (mg/dL)"
          helperText="Normal fasting range: 70-99 mg/dL"
          placeholder="Enter reading"
        />
      );
      expect(screen.getByLabelText(/blood glucose/i)).toBeInTheDocument();
      expect(screen.getByText(/normal fasting range/i)).toBeInTheDocument();
    });

    it('displays error state and error message', () => {
      render(
        <Input
          label="Email Address"
          error="Please provide a valid medical contact email"
        />
      );
      expect(screen.getByText(/please provide a valid medical contact email/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('border-rose-300');
    });

    it('supports password toggling when showPasswordToggle is true', () => {
      const { container } = render(
        <Input
          label="User Password"
          type="password"
          showPasswordToggle
          defaultValue="SecretPass123"
        />
      );
      const input = container.querySelector('input') as HTMLInputElement;
      expect(input).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      fireEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');

      fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Badge', () => {
    it('renders badges for different document and clinical statuses', () => {
      const { rerender } = render(<Badge variant="success">CONFIRMED</Badge>);
      expect(screen.getByText('CONFIRMED')).toHaveClass('text-emerald-800');

      rerender(<Badge variant="warning">PROCESSING</Badge>);
      expect(screen.getByText('PROCESSING')).toHaveClass('text-amber-800');

      rerender(<Badge variant="error">REJECTED</Badge>);
      expect(screen.getByText('REJECTED')).toHaveClass('text-rose-800');

      rerender(<Badge variant="brand">VERIFIED</Badge>);
      expect(screen.getByText('VERIFIED')).toHaveClass('text-teal-800');
    });
  });

  describe('Card', () => {
    it('renders card with structured header and body', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Clinical Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Patient vitals are within normal reference range.</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('Clinical Summary')).toBeInTheDocument();
      expect(screen.getByText(/patient vitals are within normal reference range/i)).toBeInTheDocument();
    });
  });

  describe('EmptyState', () => {
    it('renders empty vault state with action button', () => {
      const handleAction = jest.fn();
      render(
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No health records found"
          description="Your medical vault is currently empty. Upload your first lab report or prescription."
          actionLabel="Upload First Record"
          onAction={handleAction}
        />
      );

      expect(screen.getByText('No health records found')).toBeInTheDocument();
      expect(screen.getByText(/your medical vault is currently empty/i)).toBeInTheDocument();

      const button = screen.getByRole('button', { name: /upload first record/i });
      fireEvent.click(button);
      expect(handleAction).toHaveBeenCalledTimes(1);
    });
  });
});
