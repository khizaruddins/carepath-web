'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  HeartPulse,
  FolderLock,
  Clock,
  ShieldCheck,
  Settings,
  X,
  Lock,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/app/dashboard', icon: LayoutDashboard },
  { name: 'Health Profile', href: '/app/profile', icon: HeartPulse },
  { name: 'Documents', href: '/app/documents', icon: FolderLock },
  { name: 'Timeline', href: '/app/timeline', icon: Clock },
  { name: 'Activity', href: '/app/activity', icon: ShieldCheck },
  { name: 'Settings', href: '/app/settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      <Header onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-[80%] bg-white h-full shadow-2xl flex flex-col z-50 p-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900">CarePath Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="py-4 space-y-1 flex-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-teal-50 text-teal-900 font-bold border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50',
                    )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-teal-700' : 'text-slate-400')} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-3 bg-slate-50 rounded text-[11px] text-slate-500 flex items-center gap-2 border border-slate-200">
              <Lock className="h-3.5 w-3.5 text-teal-700 shrink-0" />
              <span>Encrypted Vault v1.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Main Container */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-16 md:pb-6 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
