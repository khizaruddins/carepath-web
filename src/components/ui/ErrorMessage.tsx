import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = 'Action could not be completed',
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-rose-200 bg-rose-50/60 p-4 text-left flex items-start gap-3',
        className,
      )}
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-rose-900">{title}</h4>
        <p className="text-xs text-rose-700 mt-1 leading-relaxed">{message}</p>
        {onRetry && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              className="border-rose-300 text-rose-800 bg-white hover:bg-rose-50"
            >
              Try again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
