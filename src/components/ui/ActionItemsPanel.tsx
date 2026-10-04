'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import type { NotificationType } from '@/lib/api/types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';
import {
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  FileText,
  UserCheck,
  RotateCcw,
  KeyRound,
  Stethoscope,
  MessageSquare,
  Bell,
  CalendarCheck,
} from 'lucide-react';

// ---------------------------------------------------------------
// Routing map: notification type → href
// ---------------------------------------------------------------
const ACTION_ROUTES: Partial<Record<NotificationType, (meta?: Record<string, any>) => string>> = {
  CONSENT_REQUESTED:       (m) => m?.consentId ? `/app/consents/${m.consentId}` : '/app/consents',
  CONSENT_APPROVED:        (m) => m?.consentId ? `/app/consents/${m.consentId}` : '/app/consents',
  CONSENT_DECLINED:        (m) => m?.consentId ? `/app/consents/${m.consentId}` : '/app/consents',
  CONSENT_REVOKED:         () => '/app/consents',
  CONSENT_EXPIRING_SOON:   (m) => m?.consentId ? `/app/consents/${m.consentId}` : '/app/consents',
  CONSENT_EXPIRED:         () => '/app/consents',
  ACCESS_REQUESTED:        () => '/app/care-team',
  ACCESS_GRANTED:          () => '/app/patients',
  DOCTOR_ASSIGNED:         (m) => m?.patientId ? `/app/patients/${m.patientId}` : '/app/patients',
  DOCUMENT_UPLOADED:       (m) => m?.documentId ? `/app/documents/${m.documentId}` : '/app/documents',
  CLINICAL_FEEDBACK_ADDED: (m) => m?.documentId ? `/app/documents/${m.documentId}` : '/app/documents',
  CONSULTATION_CREATED:    () => '/app/doctor/consultations',
  PRESCRIPTION_ISSUED:     (m) => m?.documentId ? `/app/documents/${m.documentId}` : '/app/documents',
  INVESTIGATION_ORDERED:   (m) => m?.investigationId ? `/app/investigations/${m.investigationId}` : (m?.documentId ? `/app/documents/${m.documentId}` : '/app/investigations'),
  FOLLOW_UP_SCHEDULED:     () => '/app/doctor/follow-ups',
  DOCUMENT_RESTORED:       (m) => m?.documentId ? `/app/documents/${m.documentId}` : '/app/documents',
  DOCTOR_VERIFIED:         () => '/app/doctor/profile',
  SECURITY_ALERT:          () => '/app/activity',
};

// ---------------------------------------------------------------
// Visual config per notification type
// ---------------------------------------------------------------
type Urgency = 'critical' | 'high' | 'medium' | 'low';
type BadgeVariant = 'error' | 'warning' | 'info' | 'brand' | 'success' | 'neutral';

interface ActionConfig {
  icon: React.ReactNode;
  urgency: Urgency;
  cta: string;
  badgeVariant: BadgeVariant;
}

const ACTION_CONFIG: Partial<Record<NotificationType, ActionConfig>> = {
  CONSENT_REQUESTED:       { icon: <KeyRound className="h-4 w-4" />,       urgency: 'critical', cta: 'Review Request',  badgeVariant: 'error' },
  CONSENT_EXPIRING_SOON:   { icon: <KeyRound className="h-4 w-4" />,       urgency: 'high',     cta: 'View Consent',   badgeVariant: 'warning' },
  CONSENT_REVOKED:         { icon: <KeyRound className="h-4 w-4" />,       urgency: 'high',     cta: 'View Details',   badgeVariant: 'warning' },
  CONSENT_DECLINED:        { icon: <KeyRound className="h-4 w-4" />,       urgency: 'medium',   cta: 'View Details',   badgeVariant: 'info' },
  CONSENT_APPROVED:        { icon: <KeyRound className="h-4 w-4" />,       urgency: 'low',      cta: 'Open',           badgeVariant: 'success' },
  CONSENT_EXPIRED:         { icon: <KeyRound className="h-4 w-4" />,       urgency: 'low',      cta: 'View',           badgeVariant: 'neutral' },
  ACCESS_REQUESTED:        { icon: <ShieldAlert className="h-4 w-4" />,    urgency: 'critical', cta: 'Review',         badgeVariant: 'error' },
  ACCESS_GRANTED:          { icon: <ShieldAlert className="h-4 w-4" />,    urgency: 'low',      cta: 'View',           badgeVariant: 'success' },
  DOCTOR_ASSIGNED:         { icon: <Stethoscope className="h-4 w-4" />,    urgency: 'high',     cta: 'View Patient',   badgeVariant: 'brand' },
  DOCUMENT_UPLOADED:       { icon: <FileText className="h-4 w-4" />,       urgency: 'medium',   cta: 'Review Doc',     badgeVariant: 'info' },
  CLINICAL_FEEDBACK_ADDED: { icon: <MessageSquare className="h-4 w-4" />,  urgency: 'critical', cta: 'View Feedback',  badgeVariant: 'error' },
  CONSULTATION_CREATED:    { icon: <CalendarCheck className="h-4 w-4" />,  urgency: 'high',     cta: 'View',           badgeVariant: 'brand' },
  PRESCRIPTION_ISSUED:     { icon: <FileText className="h-4 w-4" />,       urgency: 'high',     cta: 'View Rx',        badgeVariant: 'brand' },
  INVESTIGATION_ORDERED:   { icon: <FileText className="h-4 w-4" />,       urgency: 'high',     cta: 'View Order',     badgeVariant: 'brand' },
  FOLLOW_UP_SCHEDULED:     { icon: <CalendarCheck className="h-4 w-4" />,  urgency: 'medium',   cta: 'View',           badgeVariant: 'info' },
  DOCUMENT_RESTORED:       { icon: <RotateCcw className="h-4 w-4" />,      urgency: 'low',      cta: 'View Doc',       badgeVariant: 'success' },
  DOCTOR_VERIFIED:         { icon: <UserCheck className="h-4 w-4" />,      urgency: 'low',      cta: 'View Profile',   badgeVariant: 'success' },
  SECURITY_ALERT:          { icon: <ShieldAlert className="h-4 w-4" />,    urgency: 'critical', cta: 'View Audit',     badgeVariant: 'error' },
};

const URGENCY_ORDER: Record<Urgency, number> = { critical: 0, high: 1, medium: 2, low: 3 };
const URGENCY_LABEL: Record<Urgency, string>  = { critical: 'Urgent', high: 'Action Needed', medium: 'Attention', low: 'Info' };
const URGENCY_BADGE: Record<Urgency, 'error' | 'warning' | 'info' | 'neutral'> = {
  critical: 'error', high: 'warning', medium: 'info', low: 'neutral',
};
const URGENCY_ICON_BG: Record<Urgency, string> = {
  critical: 'bg-rose-50 text-rose-600',
  high:     'bg-amber-50 text-amber-600',
  medium:   'bg-sky-50 text-sky-600',
  low:      'bg-emerald-50 text-emerald-600',
};

// ---------------------------------------------------------------
// Component
// ---------------------------------------------------------------
interface ActionItemsPanelProps {
  maxItems?: number;
  compact?: boolean;
}

export function ActionItemsPanel({ maxItems = 6, compact = false }: ActionItemsPanelProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.getNotifications(20, 0, false),
    refetchInterval: 30_000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.notifications ?? [];
  const totalUnread   = data?.unreadCount ?? 0;

  const actions = notifications
    .map((n) => {
      const cfg: ActionConfig = ACTION_CONFIG[n.type] ?? {
        icon: <Bell className="h-4 w-4" />,
        urgency: 'low' as Urgency,
        cta: 'View',
        badgeVariant: 'neutral' as BadgeVariant,
      };
      const routeFn = ACTION_ROUTES[n.type];
      const href = routeFn ? routeFn(n.metadata ?? {}) : '/app/dashboard';
      return { n, cfg, href };
    })
    .sort((a, b) => URGENCY_ORDER[a.cfg.urgency] - URGENCY_ORDER[b.cfg.urgency])
    .slice(0, maxItems);

  const content = (
    <>
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="h-5 w-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : actions.length === 0 ? (
        <div className="py-10 text-center space-y-2">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <p className="text-xs font-semibold text-slate-800">All caught up!</p>
          <p className="text-[11px] text-slate-500">No pending actions requiring your attention.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 text-xs">
          {actions.map(({ n, cfg, href }) => (
            <div
              key={n.id}
              className="p-3.5 sm:p-4 flex items-start gap-3 hover:bg-slate-50/80 transition-colors"
            >
              {/* Urgency icon */}
              <div className={`mt-0.5 h-7 w-7 shrink-0 rounded-md flex items-center justify-center ${URGENCY_ICON_BG[cfg.urgency]}`}>
                {cfg.icon}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-slate-900 text-[13px] leading-tight">
                    {n.title}
                  </span>
                  <Badge variant={URGENCY_BADGE[cfg.urgency]} size="sm">
                    {URGENCY_LABEL[cfg.urgency]}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                <p className="text-[10px] text-slate-400">
                  {new Date(n.createdAt).toLocaleString([], {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>

              {/* CTA */}
              <div className="shrink-0">
                <Link
                  href={href}
                  onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                >
                  <Button
                    size="sm"
                    variant={cfg.urgency === 'critical' ? 'primary' : 'outline'}
                    rightIcon={<ArrowRight className="h-3 w-3" />}
                  >
                    {cfg.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalUnread > maxItems && (
        <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            +{totalUnread - maxItems} more items require attention
          </span>
          <Link href="/app/notifications">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="h-3 w-3" />}>
              View All
            </Button>
          </Link>
        </div>
      )}
    </>
  );

  if (compact) return <>{content}</>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100">
        <div>
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
            <Zap className="h-4 w-4 text-amber-500" />
            Action Items
          </CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">Tasks requiring your immediate attention</p>
        </div>
        {totalUnread > 0 && (
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">
            {totalUnread} pending
          </span>
        )}
      </CardHeader>
      <CardContent className="p-0">{content}</CardContent>
    </Card>
  );
}
