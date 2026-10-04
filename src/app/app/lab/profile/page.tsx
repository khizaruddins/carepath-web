'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi, RegisterLabPayload } from '@/lib/api/lab';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  FileCheck,
  UserPlus,
  Users,
  CheckCircle2,
  ShieldAlert,
  Edit2,
} from 'lucide-react';
import { LabMemberRole } from '@/lib/api/types';

export default function LabProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Registration / Edit Modal State
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Form states
  const [regForm, setRegForm] = useState<RegisterLabPayload>({
    name: '',
    legalName: '',
    licenseNumber: '',
    contactEmail: user?.email || '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    supportedSampleTypes: ['Blood (Serum)', 'Blood (EDTA)', 'Urine'],
  });

  const [memberUserId, setMemberUserId] = useState('');
  const [memberRole, setMemberRole] = useState<LabMemberRole>('LAB_TECHNICIAN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch Lab association
  const {
    data: labData,
    isLoading: labLoading,
    error: labError,
    refetch,
  } = useQuery({
    queryKey: ['my-lab-profile'],
    queryFn: () => labApi.getMyLab(),
  });

  const lab = labData?.lab;
  const isLabAdmin = labData?.role === 'LAB_ADMIN';

  // Fetch Members
  const {
    data: members,
    isLoading: membersLoading,
  } = useQuery({
    queryKey: ['lab-members', lab?.id],
    queryFn: () => (lab?.id ? labApi.listLabMembers(lab.id) : Promise.resolve([])),
    enabled: !!lab?.id,
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterLabPayload) => labApi.registerLab(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lab-profile'] });
      setIsRegisterOpen(false);
      setSuccessMessage('Laboratory registered successfully and submitted for administrative verification.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to register laboratory');
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: Partial<RegisterLabPayload>) => {
      if (!lab?.id) throw new Error('No lab ID');
      return labApi.updateLabProfile(lab.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-lab-profile'] });
      setIsEditOpen(false);
      setSuccessMessage('Laboratory profile updated successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to update laboratory profile');
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: () => {
      if (!lab?.id) throw new Error('No lab ID');
      return labApi.addLabMember(lab.id, memberUserId, memberRole);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-members', lab?.id] });
      setIsAddMemberOpen(false);
      setMemberUserId('');
      setSuccessMessage('Staff member added to laboratory successfully.');
    },
    onError: (err: any) => {
      setErrorMessage(err?.response?.data?.message || err.message || 'Failed to add staff member');
    },
  });

  if (labLoading) {
    return <LoadingSpinner message="Loading laboratory profile..." />;
  }

  // Not yet associated with a lab
  if (!lab) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 text-left py-8">
        <Card className="border-dashed border-2">
          <CardContent className="py-12 px-6 text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-700 rounded-full flex items-center justify-center mx-auto">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              No Registered Laboratory Facility
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your account is not currently linked to an active diagnostic laboratory. Register your diagnostic center, clinical pathology lab, or reference laboratory facility to start processing orders.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                setErrorMessage(null);
                setIsRegisterOpen(true);
              }}
            >
              Register Laboratory Facility
            </Button>
          </CardContent>
        </Card>

        {/* Registration Dialog */}
        <Dialog
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          title="Register Diagnostic Laboratory"
          description="Enter your regulatory and facility details. All fields are verified by platform administrators."
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setErrorMessage(null);
              registerMutation.mutate(regForm);
            }}
            className="space-y-4"
          >
            {errorMessage && <ErrorMessage message={errorMessage} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Facility Name"
                placeholder="e.g. Apex Reference Laboratories"
                required
                value={regForm.name}
                onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
              />
              <Input
                label="Legal Registered Entity"
                placeholder="e.g. Apex Diagnostics Solutions Pvt. Ltd."
                value={regForm.legalName || ''}
                onChange={(e) => setRegForm({ ...regForm, legalName: e.target.value })}
              />
              <Input
                label="Medical License Number"
                placeholder="e.g. LAB-REG-2026-98124"
                required
                value={regForm.licenseNumber}
                onChange={(e) => setRegForm({ ...regForm, licenseNumber: e.target.value })}
              />
              <Input
                label="Official Contact Email"
                type="email"
                required
                value={regForm.contactEmail}
                onChange={(e) => setRegForm({ ...regForm, contactEmail: e.target.value })}
              />
              <Input
                label="Contact Phone Number"
                required
                value={regForm.contactPhone}
                onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })}
              />
              <Input
                label="Operating City"
                placeholder="e.g. Metropolis"
                required
                value={regForm.city || ''}
                onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
              />
              <Input
                label="State / Province"
                placeholder="e.g. NY"
                value={regForm.state || ''}
                onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
              />
              <Input
                label="Postal / ZIP Code"
                placeholder="e.g. 10001"
                value={regForm.pincode || ''}
                onChange={(e) => setRegForm({ ...regForm, pincode: e.target.value })}
              />
            </div>

            <Input
              label="Physical Facility Address"
              placeholder="e.g. Suite 400, Healthcare Boulevard"
              value={regForm.address || ''}
              onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button variant="ghost" type="button" onClick={() => setIsRegisterOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={registerMutation.isPending}>
                {registerMutation.isPending ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          </form>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">&times;</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-md flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900 font-bold">&times;</button>
        </div>
      )}

      {/* Verification Status Banner */}
      {lab.verificationStatus === 'PENDING' && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-amber-900">
                Verification Pending
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Your laboratory verification is pending administrative review. Diagnostic processing workflows will remain restricted until verified.
              </p>
            </div>
          </div>
        </div>
      )}

      {lab.verificationStatus === 'REJECTED' && (
        <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-md">
          <div className="flex items-start">
            <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-rose-900">
                Verification Not Approved
              </h3>
              <p className="text-xs text-rose-800 mt-0.5">
                {lab.verificationNotes || 'Your registration was not approved. Please review details below and update required information.'}
              </p>
              {isLabAdmin && (
                <div className="mt-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
                    Update Details
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">{lab.name}</h1>
                  <Badge
                    variant={
                      lab.verificationStatus === 'VERIFIED'
                        ? 'success'
                        : lab.verificationStatus === 'PENDING'
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {lab.verificationStatus}
                  </Badge>
                </div>
                {lab.legalName && (
                  <p className="text-xs text-slate-500 mt-0.5">{lab.legalName}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span>License: <strong className="text-slate-800">{lab.licenseNumber}</strong></span>
                  <span>•</span>
                  <span>Your Role: <strong className="text-teal-800">{labData.role}</strong></span>
                </div>
              </div>
            </div>

            {isLabAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 self-start sm:self-auto"
                onClick={() => {
                  setRegForm({
                    name: lab.name,
                    legalName: lab.legalName || '',
                    licenseNumber: lab.licenseNumber,
                    contactEmail: lab.contactEmail,
                    contactPhone: lab.contactPhone,
                    address: lab.address || '',
                    city: lab.city || '',
                    state: lab.state || '',
                    pincode: lab.pincode || '',
                    supportedSampleTypes: lab.supportedSampleTypes || [],
                  });
                  setIsEditOpen(true);
                }}
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Edit Facility</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Facility Information & Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Mail className="h-4 w-4 text-teal-700" />
              <span>Contact & Licensing</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Official Email</span>
              <span className="text-slate-800 font-medium">{lab.contactEmail}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Telephone</span>
              <span className="text-slate-800 font-medium">{lab.contactPhone}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Government License Number</span>
              <span className="text-slate-900 font-mono font-medium">{lab.licenseNumber}</span>
            </div>
            {lab.verifiedAt && (
              <div>
                <span className="text-slate-400 block font-medium">Verification Timestamp</span>
                <span className="text-slate-800">{formatDate(lab.verifiedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3 px-5 border-b border-slate-200">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-700" />
              <span>Diagnostic Center Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Address</span>
              <span className="text-slate-800">{lab.address || 'Address not registered'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-400 block font-medium">City</span>
                <span className="text-slate-800 font-medium">{lab.city || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">State</span>
                <span className="text-slate-800 font-medium">{lab.state || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Pincode</span>
                <span className="text-slate-800 font-medium">{lab.pincode || '—'}</span>
              </div>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Supported Specimen Types</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {lab.supportedSampleTypes?.length ? (
                  lab.supportedSampleTypes.map((st) => (
                    <span
                      key={st}
                      className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]"
                    >
                      {st}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Standard Diagnostic Specimens</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Members Section */}
      <Card>
        <CardHeader className="py-3 px-5 border-b border-slate-200 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-teal-700" />
              <span>Laboratory Personnel</span>
            </CardTitle>
            <p className="text-xs text-slate-500">Authorized facility staff memberships</p>
          </div>
          {isLabAdmin && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                setErrorMessage(null);
                setIsAddMemberOpen(true);
              }}
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Staff</span>
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {membersLoading ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading staff members...</div>
          ) : !members || members.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">No additional staff members.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-4">User</th>
                    <th className="py-2.5 px-4">Role</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {m.user?.email || m.userId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {formatDate(m.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Laboratory Profile"
        description="Update contact, location, and operational facility details."
        maxWidth="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            updateMutation.mutate(regForm);
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Facility Name"
              required
              value={regForm.name}
              onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
            />
            <Input
              label="Legal Entity"
              value={regForm.legalName || ''}
              onChange={(e) => setRegForm({ ...regForm, legalName: e.target.value })}
            />
            <Input
              label="Official Contact Email"
              type="email"
              required
              value={regForm.contactEmail}
              onChange={(e) => setRegForm({ ...regForm, contactEmail: e.target.value })}
            />
            <Input
              label="Contact Phone"
              required
              value={regForm.contactPhone}
              onChange={(e) => setRegForm({ ...regForm, contactPhone: e.target.value })}
            />
            <Input
              label="City"
              value={regForm.city || ''}
              onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
            />
            <Input
              label="State"
              value={regForm.state || ''}
              onChange={(e) => setRegForm({ ...regForm, state: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            value={regForm.address || ''}
            onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Add Staff Member Dialog */}
      <Dialog
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        title="Add Staff Member"
        description="Assign a user ID and facility role to join this laboratory facility."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErrorMessage(null);
            addMemberMutation.mutate();
          }}
          className="space-y-4"
        >
          {errorMessage && <ErrorMessage message={errorMessage} />}

          <Input
            label="User UUID"
            placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
            required
            value={memberUserId}
            onChange={(e) => setMemberUserId(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Facility Role
            </label>
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as LabMemberRole)}
              className="w-full text-xs rounded-md border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-700"
            >
              <option value="LAB_TECHNICIAN">LAB_TECHNICIAN (Sample collection & analysis)</option>
              <option value="LAB_PATHOLOGIST">LAB_PATHOLOGIST (Verification & report signoff)</option>
              <option value="LAB_ADMIN">LAB_ADMIN (Full facility & staff management)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button variant="ghost" type="button" onClick={() => setIsAddMemberOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={addMemberMutation.isPending}>
              {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
