import React from 'react';

export function TimelineSkeleton() {
  return (
    <div className="space-y-8 animate-pulse text-left py-2" aria-label="Loading timeline">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-4">
          {/* Month Group Header Skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-28 bg-slate-200 rounded-sm" />
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* Spine Items */}
          <div className="space-y-4 pl-4 sm:pl-28 relative before:hidden sm:before:block before:absolute before:left-24 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {[1, 2, 3].map((card) => (
              <div key={card} className="relative">
                {/* Desktop Date & Dot */}
                <div className="hidden sm:block absolute -left-28 top-3 w-20 text-right">
                  <div className="h-3 w-12 bg-slate-200 rounded-sm ml-auto" />
                </div>
                <div className="hidden sm:block absolute -left-4 top-3.5 h-2.5 w-2.5 rounded-full bg-slate-300" />

                {/* Card Skeleton */}
                <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="h-4 w-24 bg-slate-200 rounded-sm" />
                    <div className="h-3 w-16 bg-slate-200 rounded-sm" />
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded-sm" />
                  <div className="h-3 w-1/2 bg-slate-100 rounded-sm" />
                  <div className="pt-2 flex justify-end">
                    <div className="h-7 w-24 bg-slate-200 rounded-sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
