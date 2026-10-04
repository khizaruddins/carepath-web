'use client';

import React, { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LabCollectionMode, DiscoveredLabItem } from '@/lib/api/types';
import { InvestigationRequest } from '@/lib/api/doctor';
import {
  Building2,
  Home,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  MapPin,
  Lock,
} from 'lucide-react';

interface LabSelectionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  labItem: DiscoveredLabItem | null;
  investigation: InvestigationRequest | null;
  onConfirm: (payload: {
    labId: string;
    collectionMode: LabCollectionMode;
    collectionAddress?: string;
    preferredDate?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function LabSelectionConfirmModal({
  isOpen,
  onClose,
  labItem,
  investigation,
  onConfirm,
  isLoading = false,
}: LabSelectionConfirmModalProps) {
  const [collectionMode, setCollectionMode] = useState<LabCollectionMode>('FACILITY_VISIT');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  );
  const [consentAcknowledged, setConsentAcknowledged] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!labItem || !investigation) return null;

  const basePrice = labItem.pricing.testPrice ?? labItem.pricing.basePrice ?? 0;
  const homeFee = collectionMode === 'HOME_COLLECTION' ? labItem.pricing.homeCollectionFee : 0;
  const totalPrice = basePrice + homeFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (collectionMode === 'HOME_COLLECTION' && !address.trim()) {
      setValidationError('Please provide your complete residential collection address.');
      return;
    }
    if (!consentAcknowledged) {
      setValidationError('Please acknowledge the temporary clinical access terms.');
      return;
    }
    setValidationError(null);

    await onConfirm({
      labId: labItem.lab.id,
      collectionMode,
      collectionAddress: collectionMode === 'HOME_COLLECTION' ? address.trim() : undefined,
      preferredDate: preferredDate || undefined,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Diagnostic Center & Clinical Booking"
      description="Review test pricing and temporary clinical connection details."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-left">
        {/* Lab & Test Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Prescribed Investigation
              </span>
              <span className="font-bold text-slate-900 text-sm">
                {investigation.testName || investigation.investigationName || 'Prescribed Investigation'}
              </span>
              <span className="block text-slate-500 text-[11px] mt-0.5">
                Prescribed by Dr. {investigation.doctor?.user?.profile?.fullName || 'Physician'}
              </span>
            </div>
            {labItem.pricing.isAccredited && (
              <Badge variant="success" size="sm">
                NABL / CAP Accredited
              </Badge>
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-700">
            <span className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-3.5 w-3.5 text-teal-700" />
              {labItem.lab.name}
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Est. TAT: {labItem.tat}
            </span>
          </div>

          {labItem.location && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
              <span>
                {labItem.location.branchName} • {labItem.location.address}, {labItem.location.city}
                {labItem.distanceKm !== undefined && ` (${labItem.distanceKm.toFixed(1)} km away)`}
              </span>
            </div>
          )}
        </div>

        {/* Collection Mode Selection */}
        <div className="space-y-2">
          <label className="block text-slate-800 font-semibold">
            Choose Sample Collection Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                collectionMode === 'FACILITY_VISIT'
                  ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-medium'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="collectionMode"
                value="FACILITY_VISIT"
                checked={collectionMode === 'FACILITY_VISIT'}
                onChange={() => setCollectionMode('FACILITY_VISIT')}
                className="mt-0.5 text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-semibold block flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-teal-700" /> Visit Center
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Walk in to branch facility
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                !labItem.isHomeCollectionAvailable
                  ? 'opacity-50 cursor-not-allowed border-slate-200 bg-slate-50'
                  : collectionMode === 'HOME_COLLECTION'
                  ? 'border-teal-700 bg-teal-50/60 text-teal-950 font-medium'
                  : 'border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <input
                type="radio"
                name="collectionMode"
                value="HOME_COLLECTION"
                disabled={!labItem.isHomeCollectionAvailable}
                checked={collectionMode === 'HOME_COLLECTION'}
                onChange={() => setCollectionMode('HOME_COLLECTION')}
                className="mt-0.5 text-teal-700 focus:ring-teal-700"
              />
              <div>
                <span className="font-semibold block flex items-center gap-1">
                  <Home className="h-3.5 w-3.5 text-teal-700" /> Home Collection
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {labItem.isHomeCollectionAvailable
                    ? `+₹${labItem.pricing.homeCollectionFee} collection fee`
                    : 'Not offered by this center'}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Address & Date for Home Collection */}
        {collectionMode === 'HOME_COLLECTION' && (
          <div className="space-y-1.5 p-3 rounded-lg bg-teal-50/40 border border-teal-100">
            <label className="block text-slate-800 font-semibold">
              Home Collection Address *
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Flat/House number, Street, Landmark, City & Pincode..."
              className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        )}

        {/* Preferred Date */}
        <div>
          <label className="block text-slate-800 font-semibold mb-1">
            Preferred Sample Collection Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full text-xs p-2 rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-teal-700"
            />
          </div>
        </div>

        {/* Transparent Price Breakdown */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Diagnostic Test Fee</span>
            <span className="font-medium">₹{basePrice.toFixed(2)}</span>
          </div>
          {collectionMode === 'HOME_COLLECTION' && (
            <div className="flex justify-between text-slate-600">
              <span>Home Phlebotomy Service Fee</span>
              <span className="font-medium">₹{homeFee.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-900 font-bold text-sm">
            <span>Total Payable</span>
            <span className="text-teal-800">₹{totalPrice.toFixed(2)}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Transparent pricing guarantee • No hidden processing or platform charges.
          </p>
        </div>

        {/* Temporary Clinical Access Explanation */}
        <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-950 text-xs">
            <Lock className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
            <span>CarePath Temporary Clinical Access Agreement</span>
          </div>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            By confirming this booking, you grant <strong>{labItem.lab.name}</strong> a temporary 72-hour clinical connection. This allows their pathology staff to view only the minimum necessary details (your name, prescribed test specifications, and prescribing physician&apos;s prep notes).
          </p>
          <p className="text-[11px] text-slate-700 leading-relaxed">
            Your full medical vault remains strictly isolated. This temporary access <strong>automatically revokes</strong> as soon as your report is finalized and delivered to your vault.
          </p>
          <label className="flex items-start gap-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={consentAcknowledged}
              onChange={(e) => setConsentAcknowledged(e.target.checked)}
              className="mt-0.5 text-teal-700 focus:ring-teal-700 rounded"
            />
            <span className="text-[11px] text-slate-800 font-medium">
              I understand and authorize temporary purpose-bound clinical access for this test.
            </span>
          </label>
        </div>

        {validationError && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-800 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!consentAcknowledged}
          >
            Confirm &amp; Create Lab Booking
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
