'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-context';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Notification, NotificationType } from './api/types';
import {
  Bell,
  CheckCircle2,
  FileText,
  UserCheck,
  Stethoscope,
  Pill,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeNotification: Notification | null;
  dismissNotification: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeNotification: null,
  dismissNotification: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const dismissNotification = useCallback(() => {
    setActiveNotification(null);
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  }, []);

  const handleActionInvalidation = useCallback(
    (type: NotificationType | string, metadata?: Record<string, any> | null) => {
      // Invalidate general notification queries
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });

      const notifType = String(type);

      // Clinical Feedback
      if (notifType.includes('CLINICAL_FEEDBACK') || notifType.includes('feedback')) {
        queryClient.invalidateQueries({ queryKey: ['patient-documents'] });
        queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
        queryClient.invalidateQueries({ queryKey: ['document-feedback'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-accessible-documents'] });
        if (metadata?.documentId) {
          queryClient.invalidateQueries({ queryKey: ['document-detail', metadata.documentId] });
        }
      }

      // Consultations
      if (notifType.includes('CONSULTATION') || notifType.includes('consultation')) {
        queryClient.invalidateQueries({ queryKey: ['patient-consultations'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-consultations'] });
        queryClient.invalidateQueries({ queryKey: ['recent-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['health-timeline'] });
      }

      // Prescriptions
      if (notifType.includes('PRESCRIPTION') || notifType.includes('prescription')) {
        queryClient.invalidateQueries({ queryKey: ['patient-prescriptions'] });
        queryClient.invalidateQueries({ queryKey: ['recent-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['health-timeline'] });
      }

      // Investigations
      if (notifType.includes('INVESTIGATION') || notifType.includes('investigation')) {
        queryClient.invalidateQueries({ queryKey: ['patient-investigations'] });
        queryClient.invalidateQueries({ queryKey: ['recent-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['health-timeline'] });
      }

      // Follow-ups
      if (notifType.includes('FOLLOW_UP') || notifType.includes('followup')) {
        queryClient.invalidateQueries({ queryKey: ['patient-followups'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-followups'] });
        queryClient.invalidateQueries({ queryKey: ['recent-timeline'] });
        queryClient.invalidateQueries({ queryKey: ['health-timeline'] });
      }

      // Access requests & responses & doctor assignment
      if (
        notifType.includes('ACCESS') ||
        notifType.includes('CONSENT') ||
        notifType.includes('DOCTOR_ASSIGNED') ||
        notifType.includes('doctor:assigned')
      ) {
        queryClient.invalidateQueries({ queryKey: ['patient-consents'] });
        queryClient.invalidateQueries({ queryKey: ['patient-access-requests'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-patients'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-access-requests'] });
        queryClient.invalidateQueries({ queryKey: ['patient-profile'] });
      }

      // Document uploaded
      if (notifType.includes('DOCUMENT_UPLOADED') || notifType.includes('document:uploaded')) {
        queryClient.invalidateQueries({ queryKey: ['doctor-accessible-documents'] });
        queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
        queryClient.invalidateQueries({ queryKey: ['patient-documents'] });
      }

      // Document restored
      if (notifType.includes('DOCUMENT_RESTORED') || notifType.includes('document:restored')) {
        queryClient.invalidateQueries({ queryKey: ['patient-documents'] });
        queryClient.invalidateQueries({ queryKey: ['recent-documents'] });
        queryClient.invalidateQueries({ queryKey: ['archived-documents'] });
        queryClient.invalidateQueries({ queryKey: ['restore-requests'] });
      }

      // Doctor verified
      if (notifType.includes('DOCTOR_VERIFIED') || notifType.includes('verification')) {
        queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
        queryClient.invalidateQueries({ queryKey: ['admin-doctor-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-directory'] });
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('carepath_access_token') : null;
    if (!token) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:3000` : 'http://localhost:3000');

    const s = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    s.on('connect', () => {
      setIsConnected(true);
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for all new notifications
    s.on('notification:new', (notif: Notification) => {
      setActiveNotification(notif);
      handleActionInvalidation(notif.type, notif.metadata);

      // Auto-dismiss after 8 seconds
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      toastTimeoutRef.current = setTimeout(() => {
        setActiveNotification(null);
      }, 8000);
    });

    // Domain event hooks for granular realtime cache refresh
    const domainEvents = [
      'document:feedback:added',
      'consultation:created',
      'prescription:created',
      'investigation:ordered',
      'followup:scheduled',
      'access:requested',
      'access:updated',
      'doctor:assigned',
      'document:uploaded',
      'document:restored',
      'doctor:verification:updated',
    ];

    domainEvents.forEach((evt) => {
      s.on(evt, (data: any) => {
        handleActionInvalidation(evt, data);
      });
    });

    setSocket(s);

    return () => {
      s.disconnect();
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [user, handleActionInvalidation]);

  const handleToastAction = (notif: Notification) => {
    dismissNotification();
    const type = notif.type;
    const meta = notif.metadata || {};

    if (type === 'CLINICAL_FEEDBACK_ADDED') {
      router.push('/app/documents');
    } else if (type === 'ACCESS_REQUESTED') {
      router.push('/app/consents');
    } else if (type === 'ACCESS_GRANTED' || type === 'DOCTOR_ASSIGNED') {
      router.push('/app/doctor/patients');
    } else if (type === 'CONSULTATION_CREATED' || type === 'PRESCRIPTION_ISSUED' || type === 'INVESTIGATION_ORDERED' || type === 'FOLLOW_UP_SCHEDULED') {
      if (user?.role === 'DOCTOR') {
        router.push('/app/doctor/patients');
      } else {
        router.push('/app/timeline');
      }
    } else if (type === 'DOCUMENT_RESTORED' || type === 'DOCUMENT_UPLOADED') {
      if (user?.role === 'DOCTOR') {
        router.push('/app/doctor/records');
      } else {
        router.push('/app/documents');
      }
    } else if (type === 'DOCTOR_VERIFIED') {
      router.push('/app/doctor/profile');
    } else {
      router.push('/app/dashboard');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'CLINICAL_FEEDBACK_ADDED':
        return <Stethoscope className="h-5 w-5 text-teal-600 shrink-0" />;
      case 'CONSULTATION_CREATED':
        return <FileText className="h-5 w-5 text-indigo-600 shrink-0" />;
      case 'PRESCRIPTION_ISSUED':
        return <Pill className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'INVESTIGATION_ORDERED':
        return <FileText className="h-5 w-5 text-amber-600 shrink-0" />;
      case 'FOLLOW_UP_SCHEDULED':
        return <Calendar className="h-5 w-5 text-purple-600 shrink-0" />;
      case 'ACCESS_REQUESTED':
        return <UserCheck className="h-5 w-5 text-sky-600 shrink-0" />;
      case 'ACCESS_GRANTED':
      case 'DOCTOR_ASSIGNED':
      case 'DOCTOR_VERIFIED':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'DOCUMENT_RESTORED':
        return <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />;
      default:
        return <Bell className="h-5 w-5 text-teal-600 shrink-0" />;
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        activeNotification,
        dismissNotification,
      }}
    >
      {children}

      {/* Realtime Toast Banner */}
      {activeNotification && (
        <div
          role="alert"
          aria-live="assertive"
          className="fixed bottom-5 right-5 z-50 max-w-sm w-full bg-white border border-slate-200/80 rounded-xl shadow-2xl p-4 transition-all duration-300 transform translate-y-0 opacity-100 backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              {getNotificationIcon(activeNotification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  Realtime Alert
                </span>
                <button
                  onClick={dismissNotification}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
                  aria-label="Dismiss alert"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-1">
                {activeNotification.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed line-clamp-2">
                {activeNotification.message}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <button
                  onClick={() => handleToastAction(activeNotification)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-teal-800 hover:bg-teal-900 text-white text-[11px] font-semibold transition-colors shadow-xs"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
                <button
                  onClick={dismissNotification}
                  className="px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-700 text-[11px] font-medium transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
