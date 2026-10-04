import { ConsentPurpose, ConsentResourceType } from './api/types';

export function formatConsentPurpose(purpose: ConsentPurpose | string): string {
  switch (purpose) {
    case 'REVIEW_RECENT_REPORTS':
      return 'Review Recent Reports';
    case 'FOLLOW_UP_CARE':
      return 'Follow-Up Care';
    case 'SECOND_OPINION':
      return 'Second Opinion';
    case 'CONSULTATION':
      return 'Clinical Consultation';
    case 'INVESTIGATION_REVIEW':
      return 'Investigation Review';
    case 'ONGOING_CARE':
      return 'Ongoing Clinical Care';
    case 'OTHER':
    default:
      return 'Clinical Care Evaluation';
  }
}

export function formatResourceType(type: ConsentResourceType | string): string {
  switch (type) {
    case 'DOCUMENT':
      return 'Medical Documents';
    case 'TIMELINE':
      return 'Health Timeline';
    case 'CONSULTATION':
      return 'Consultations';
    case 'PRESCRIPTION':
      return 'Prescriptions';
    case 'INVESTIGATION':
      return 'Investigation Requests';
    case 'REFERRAL':
      return 'Referrals';
    case 'FOLLOW_UP':
      return 'Follow-up Plans';
    case 'PROFILE':
      return 'Health Profile';
    default:
      return type;
  }
}

export function formatResourceCategory(cat?: string | null): string {
  if (!cat) return 'All Records';
  switch (cat) {
    case 'LAB_REPORT':
      return 'Lab & Pathology';
    case 'PRESCRIPTION':
      return 'Prescriptions';
    case 'CONSULTATION':
      return 'Consultation Notes';
    case 'DISCHARGE_SUMMARY':
      return 'Discharge Summaries';
    case 'IMAGING_REPORT':
      return 'Imaging & Radiology';
    case 'XRAY':
      return 'X-Rays';
    case 'CT':
      return 'CT Scans';
    case 'MRI':
      return 'MRI Scans';
    case 'OTHER':
      return 'Other Records';
    default:
      return cat;
  }
}

export function getExpiryRemainingText(expiresAt: string): {
  isExpired: boolean;
  text: string;
  badgeClass: string;
} {
  const target = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return {
      isExpired: true,
      text: 'Expired',
      badgeClass: 'text-slate-500 bg-slate-100 border-slate-200',
    };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 1) {
    return {
      isExpired: false,
      text: `${days} days remaining`,
      badgeClass: 'text-teal-700 bg-teal-50 border-teal-200',
    };
  }

  if (days === 1) {
    return {
      isExpired: false,
      text: '1 day remaining',
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  if (hours > 0) {
    return {
      isExpired: false,
      text: `${hours} hours remaining`,
      badgeClass: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }

  return {
    isExpired: false,
    text: 'Expiring shortly',
    badgeClass: 'text-rose-700 bg-rose-50 border-rose-200',
  };
}
