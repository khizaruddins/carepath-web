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
  Users,
  KeyRound,
  Stethoscope,
  ClipboardList,
  FlaskConical,
  Building2,
} from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const isDoctor = user?.role === 'DOCTOR';
  const isLab = user?.role === 'LAB';

  const patientItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Health', href: '/app/profile', icon: HeartPulse },
    { name: 'Documents', href: '/app/documents', icon: FolderLock },
    { name: 'Timeline', href: '/app/timeline', icon: Clock },
    { name: 'Doctors', href: '/app/doctors', icon: Stethoscope },
  ];

  const doctorItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/app/patients', icon: Users },
    { name: 'Reports', href: '/app/doctor/reports', icon: FolderLock },
    { name: 'Profile', href: '/app/doctor/profile', icon: Stethoscope },
  ];

  const labItems = [
    { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Orders', href: '/app/lab/orders', icon: ClipboardList },
    { name: 'Catalog', href: '/app/lab/tests', icon: FlaskConical },
    { name: 'Profile', href: '/app/lab/profile', icon: Building2 },
  ];

  const items = isDoctor ? doctorItems : isLab ? labItems : patientItems;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 flex items-center justify-around"
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/app/dashboard' && pathname?.startsWith(`${item.href}/`));
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2 rounded-md text-[10px] font-medium transition-colors select-none min-w-[56px]',
              isActive ? 'text-teal-800 font-semibold' : 'text-slate-500 hover:text-slate-900',
            )}
          >
            <Icon className={cn('h-5 w-5 mb-0.5', isActive ? 'text-teal-700' : 'text-slate-400')} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
