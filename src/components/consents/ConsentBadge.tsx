'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { ConsentStatus } from '@/lib/api/types';

interface ConsentBadgeProps {
  status: ConsentStatus;
  size?: 'sm' | 'md';
}

export function ConsentBadge({ status, size = 'sm' }: ConsentBadgeProps) {
  switch (status) {
    case 'APPROVED':
      return (
        <Badge variant="success" size={size} dot>
          Active Access
        </Badge>
      );
    case 'PENDING':
      return (
        <Badge variant="warning" size={size} dot>
          Pending Review
        </Badge>
      );
    case 'REVOKED':
      return (
        <Badge variant="error" size={size}>
          Revoked
        </Badge>
      );
    case 'DECLINED':
      return (
        <Badge variant="neutral" size={size}>
          Declined
        </Badge>
      );
    case 'EXPIRED':
      return (
        <Badge variant="neutral" size={size}>
          Expired
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="neutral" size={size}>
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge variant="neutral" size={size}>
          {status}
        </Badge>
      );
  }
}
