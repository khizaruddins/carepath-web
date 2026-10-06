'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  HeartPulse,
  FolderLock,
  Clock,
  ShieldCheck,
  Settings,
  Lock,
  Users,
  KeyRound,
  Stethoscope,
  FlaskConical,
  ClipboardList,
  Building2,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';
  const isLab = user?.role === 'LAB';
  const isAdmin = user?.role === 'ADMIN';

  const patientItems = [
    {
      name: 'Dashboard',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Health Profile',
      href: '/app/profile',
      icon: HeartPulse,
    },
    {
      name: 'Documents',
      href: '/app/documents',
      icon: FolderLock,
    },
    {
      name: 'Timeline',
      href: '/app/timeline',
      icon: Clock,
    },
    {
      name: 'Doctors',
      href: '/app/doctors',
      icon: Stethoscope,
    },
    {
      name: 'Investigations',
      href: '/app/investigations',
      icon: FlaskConical,
    },
    {
      name: 'Consent & Sharing',
      href: '/app/consents',
      icon: KeyRound,
    },
    {
      name: 'Activity',
      href: '/app/activity',
      icon: ShieldCheck,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  const doctorItems = [
    {
      name: 'Overview',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Patients',
      href: '/app/patients',
      icon: Users,
    },
    {
      name: 'Requests',
      href: '/app/doctor/requests',
      icon: KeyRound,
    },
    {
      name: 'Reports',
      href: '/app/doctor/reports',
      icon: FolderLock,
    },
    {
      name: 'Consultations',
      href: '/app/doctor/consultations',
      icon: Clock,
    },
    {
      name: 'Follow-ups',
      href: '/app/doctor/follow-ups',
      icon: HeartPulse,
    },
    {
      name: 'Profile',
      href: '/app/doctor/profile',
      icon: Stethoscope,
    },
    {
      name: 'Activity',
      href: '/app/activity',
      icon: ShieldCheck,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  const labItems = [
    {
      name: 'Overview',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Orders',
      href: '/app/lab/orders',
      icon: ClipboardList,
    },
    {
      name: 'Test Catalog',
      href: '/app/lab/tests',
      icon: FlaskConical,
    },
    {
      name: 'Laboratory Profile',
      href: '/app/lab/profile',
      icon: Building2,
    },
    {
      name: 'Activity',
      href: '/app/activity',
      icon: ShieldCheck,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  const adminItems = [
    {
      name: 'Admin Overview',
      href: '/app/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Doctor Verifications',
      href: '/app/admin/verifications',
      icon: Users,
    },
    {
      name: 'Lab Verifications',
      href: '/app/admin/lab-verifications',
      icon: Building2,
    },
    {
      name: 'Restore Queue',
      href: '/app/admin/restore-requests',
      icon: FolderLock,
    },
    {
      name: 'Security Audit Log',
      href: '/app/activity',
      icon: ShieldCheck,
    },
    {
      name: 'Settings',
      href: '/app/settings',
      icon: Settings,
    },
  ];

  const items = isAdmin ? adminItems : isDoctor ? doctorItems : isLab ? labItems : patientItems;

  return (
    <aside className="hidden md:flex flex-col w-56 shrink-0 bg-slate-50 border-r border-slate-200 min-h-[calc(100vh-3.5rem)]">
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2">
          <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
            {isAdmin
              ? 'System Administration'
              : isDoctor
              ? 'Clinician Portal'
              : isLab
              ? 'Laboratory Operations'
              : 'Patient Health Vault'}
          </p>
        </div>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname?.startsWith(`${item.href}/`));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-md transition-colors select-none',
                isActive
                  ? 'bg-white text-teal-800 shadow-2xs font-semibold border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-slate-600',
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Security reassurance footer in sidebar */}
      <div className="p-3 border-t border-slate-200">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-slate-100 text-[11px] text-slate-500 font-medium">
          <Lock className="h-3.5 w-3.5 text-teal-700 shrink-0" />
          <span className="truncate">
            {isAdmin
              ? 'Supervised Admin Session'
              : isDoctor
              ? 'Verified Provider Session'
              : 'Encrypted Medical Vault'}
          </span>
        </div>
      </div>
    </aside>
  );
}
