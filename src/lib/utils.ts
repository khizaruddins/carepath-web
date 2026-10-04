import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return '—';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return String(dateString);
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function formatCategory(cat?: string): string {
  switch (cat) {
    case 'LAB_REPORT':
      return 'Lab Report';
    case 'PRESCRIPTION':
      return 'Prescription';
    case 'CONSULTATION':
      return 'Consultation Note';
    case 'DISCHARGE_SUMMARY':
      return 'Discharge Summary';
    case 'IMAGING_REPORT':
      return 'Imaging Report';
    case 'XRAY':
      return 'X-Ray';
    case 'CT':
      return 'CT Scan';
    case 'MRI':
      return 'MRI Scan';
    case 'OTHER':
      return 'General Record';
    default:
      return cat || 'Document';
  }
}

export function formatBloodGroup(bg?: string): string {
  switch (bg) {
    case 'A_POSITIVE':
      return 'A+';
    case 'A_NEGATIVE':
      return 'A-';
    case 'B_POSITIVE':
      return 'B+';
    case 'B_NEGATIVE':
      return 'B-';
    case 'AB_POSITIVE':
      return 'AB+';
    case 'AB_NEGATIVE':
      return 'AB-';
    case 'O_POSITIVE':
      return 'O+';
    case 'O_NEGATIVE':
      return 'O-';
    default:
      return bg || 'Unknown';
  }
}
