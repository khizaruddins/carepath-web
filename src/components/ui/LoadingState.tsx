import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded bg-slate-200/80', className)}
      {...props}
    />
  );
}

export function LoadingCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-2 flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>
  );
}

export function LoadingTableRows({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100 bg-white">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="py-3.5 px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-8 rounded-md shrink-0" />
            <div className="space-y-1.5 flex-1 max-w-sm">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-24 hidden sm:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({
  message,
  className,
  size = 'md',
}: {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <Loader2 className={cn('animate-spin text-teal-700', sizeClasses[size], message ? 'mb-2.5' : '')} />
      {message && <p className="text-xs text-slate-500 font-medium">{message}</p>}
    </div>
  );
}
