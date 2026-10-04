import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-slate-300 bg-slate-50/50',
        className,
      )}
    >
      {icon && (
        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4 ring-1 ring-slate-200">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs text-slate-600 max-w-sm mb-6 leading-relaxed">{description}</p>
      {action ? (
        <div className="flex flex-wrap items-center justify-center gap-3">{action}</div>
      ) : (actionLabel || secondaryActionLabel) ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      ) : null}
      {children}
    </div>
  );
}
