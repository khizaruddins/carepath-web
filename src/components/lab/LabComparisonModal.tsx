'use client';

import React from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { DiscoveredLabItem } from '@/lib/api/types';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Home,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface LabComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  labs: DiscoveredLabItem[];
  onSelectLab: (labItem: DiscoveredLabItem) => void;
}

export function LabComparisonModal({
  isOpen,
  onClose,
  labs,
  onSelectLab,
}: LabComparisonModalProps) {
  if (labs.length === 0) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Laboratory Comparison"
      description="Compare pricing, turnaround time, accreditation, and logistics between available diagnostic centers."
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs text-left">
        {/* Table / Grid Container with horizontal scroll on smaller screens */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 font-semibold text-slate-500 w-1/4 uppercase tracking-wider text-[10px]">
                  Feature / Parameter
                </th>
                {labs.map((item) => (
                  <th key={item.lab.id} className="p-3 text-slate-900 border-l border-slate-200">
                    <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-teal-700 shrink-0" />
                      <span>{item.lab.name}</span>
                    </div>
                    {item.location && (
                      <span className="block font-normal text-[11px] text-slate-500 mt-0.5">
                        {item.location.branchName} ({item.distanceKm !== undefined ? `${item.distanceKm.toFixed(1)} km` : item.location.city})
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {/* Test Base Price */}
              <tr>
                <td className="p-3 font-medium text-slate-900 bg-slate-50/50">
                  Test Base Price
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    <span className="text-sm font-bold text-teal-900">
                      ₹{(item.pricing.testPrice ?? item.pricing.basePrice ?? 0).toFixed(2)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Home Collection Fee */}
              <tr>
                <td className="p-3 font-medium text-slate-900 bg-slate-50/50">
                  Home Collection
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    {item.isHomeCollectionAvailable ? (
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Available (+₹{item.pricing.homeCollectionFee})</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <XCircle className="h-3.5 w-3.5 text-slate-300" />
                        <span>Center Visit Only</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Turnaround Time */}
              <tr>
                <td className="p-3 font-medium text-slate-900 bg-slate-50/50">
                  Turnaround Time
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{item.tat}</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Accreditation */}
              <tr>
                <td className="p-3 font-medium text-slate-900 bg-slate-50/50">
                  Quality Accreditation
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    {item.pricing.isAccredited ? (
                      <Badge variant="success" size="sm">
                        Verified NABL / CAP
                      </Badge>
                    ) : (
                      <span className="text-slate-500">Standard State Licensed</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Sample Types */}
              <tr>
                <td className="p-3 font-medium text-slate-900 bg-slate-50/50">
                  Sample Requirements
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    {item.sampleTypes && item.sampleTypes.length > 0 ? (
                      <span className="text-slate-600">{item.sampleTypes.join(', ')}</span>
                    ) : (
                      <span className="text-slate-400">Standard Clinical Protocol</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Actions row */}
              <tr className="bg-slate-50/30">
                <td className="p-3 font-medium text-slate-500 bg-slate-50/50">
                  Select &amp; Book
                </td>
                {labs.map((item) => (
                  <td key={item.lab.id} className="p-3 border-l border-slate-200">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onSelectLab(item);
                      }}
                      rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
                    >
                      Choose Lab
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
