'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Bell, LogOut, ShieldCheck, ChevronDown, Menu, X, User } from 'lucide-react';
import { Badge } from '../ui/Badge';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/notifications';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/lib/socket-context';

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isConnected } = useSocket();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(10, 0),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = unreadData?.unreadCount ?? notificationsData?.unreadCount ?? 0;

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markOneMutation.mutateAsync(notif.id);
    }
    setShowNotifications(false);

    const type = notif.type;
    if (type === 'CLINICAL_FEEDBACK_ADDED') {
      router.push('/app/documents');
    } else if (type === 'ACCESS_REQUESTED') {
      router.push('/app/consents');
    } else if (
      type === 'ACCESS_GRANTED' ||
      type === 'DOCTOR_ASSIGNED' ||
      type === 'CONSENT_DECLINED' ||
      type === 'CONSENT_REVOKED'
    ) {
      router.push(user?.role === 'DOCTOR' ? '/app/doctor/patients' : '/app/consents');
    } else if (
      type === 'CONSULTATION_CREATED' ||
      type === 'PRESCRIPTION_ISSUED' ||
      type === 'INVESTIGATION_ORDERED' ||
      type === 'FOLLOW_UP_SCHEDULED'
    ) {
      router.push(user?.role === 'DOCTOR' ? '/app/doctor/patients' : '/app/timeline');
    } else if (type === 'DOCUMENT_UPLOADED') {
      router.push(user?.role === 'DOCTOR' ? '/app/doctor/records' : '/app/documents');
    } else if (type === 'DOCUMENT_RESTORED') {
      router.push('/app/documents');
    } else if (type === 'DOCTOR_VERIFIED') {
      router.push('/app/doctor/profile');
    } else {
      if (user?.role === 'PATIENT') {
        router.push('/app/dashboard');
      } else if (user?.role === 'DOCTOR') {
        router.push('/app/doctor/dashboard');
      } else {
        router.push('/app/admin');
      }
    }
  };

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-4">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link href="/app/dashboard" className="flex items-center gap-2 select-none">
          <div className="h-7 w-7 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            CP
          </div>
          <span className="font-bold text-base text-slate-900 tracking-tight">CarePath</span>
          <span className="hidden sm:inline-block text-[11px] font-medium text-slate-400 border-l border-slate-200 pl-2">
            Health Vault
          </span>
        </Link>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Vault & Realtime Status Indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-50 border border-slate-200">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-medium text-[11px] text-slate-700">
            {isConnected ? 'Realtime Sync Active' : 'Connecting...'}
          </span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white border border-slate-200 shadow-lg py-2 z-50">
              <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-1.5 py-0.5 rounded-full border border-teal-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    className="text-[10px] text-teal-700 hover:text-teal-900 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
                  notificationsData.notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-teal-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs ${!notif.isRead ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="h-1.5 w-1.5 rounded-full bg-teal-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {formatDate(notif.createdAt)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 px-4 text-center">
                    <p className="text-xs text-slate-500">All caught up. No new notifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pl-2 rounded-md hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors select-none"
            aria-label="User account menu"
          >
            <div className="h-7 w-7 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center text-xs font-semibold">
              {user?.email ? user.email.slice(0, 2).toUpperCase() : 'PT'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-medium text-slate-800 truncate max-w-[120px]">
                {user?.patientProfile?.fullName || user?.email?.split('@')[0] || 'Patient'}
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {user?.role || 'Patient'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.patientProfile?.fullName || 'Patient Profile'}
                </p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant="success" size="sm" dot>
                    Active Account
                  </Badge>
                </div>
              </div>

              <Link
                href="/app/profile"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Health Profile</span>
              </Link>
              <Link
                href="/app/activity"
                onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Audit & Security Log</span>
              </Link>

              <div className="border-t border-slate-100 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 text-left"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-600" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
