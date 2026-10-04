'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const publicNavLinks = [
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'For Patients', href: '/patients' },
  { name: 'For Doctors', href: '/doctors' },
  { name: 'Security & Privacy', href: '/security' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 select-none">
          <div className="h-8 w-8 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            CP
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">CarePath</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-7" aria-label="Main Navigation">
          {publicNavLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'text-xs font-semibold tracking-wide transition-colors uppercase',
                  isActive
                    ? 'text-teal-800 border-b-2 border-teal-800 pb-1'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth CTAs */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="primary"
              size="sm"
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              Start Health Vault
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          {publicNavLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'block py-2 text-sm font-medium transition-colors',
                pathname === link.href ? 'text-teal-800 font-bold' : 'text-slate-700',
              )}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileOpen(false)} className="w-full">
              <Button variant="outline" size="md" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileOpen(false)} className="w-full">
              <Button variant="primary" size="md" className="w-full">
                Start Health Vault
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
