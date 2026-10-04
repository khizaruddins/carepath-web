'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '@/lib/api/patients';
import { Gender, BloodGroup } from '@/lib/api/types';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import {
  User,
  HeartPulse,
  Phone,
  FileCheck2,
  Plus,
  X,
  CheckCircle2,
  Save,
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('personal');

  // Form State
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('');

  // Health Information
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');

  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState('');

  const [surgeries, setSurgeries] = useState<string[]>([]);
  const [newSurgery, setNewSurgery] = useState('');

  const [medicalHistory, setMedicalHistory] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Current Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: () => patientsApi.getMyProfile(),
    enabled: !!user,
  });

  // Populate state when profile is loaded
  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
      setGender(profile.gender || '');
      setMobile(profile.mobile || '');
      setEmail(profile.email || '');
      setCity(profile.city || '');
      setBloodGroup(profile.bloodGroup || '');

      setEmergencyName(profile.emergencyContactName || '');
      setEmergencyPhone(profile.emergencyContactPhone || '');
      setEmergencyRelation(profile.emergencyContactRelation || '');

      setConditions(profile.knownConditions || []);
      setAllergies(profile.allergies || []);
      setMedications(profile.currentMedications || []);
      setSurgeries(profile.pastSurgeries || []);
      setMedicalHistory(profile.importantMedicalHistory || '');
    }
  }, [profile]);

  // Update Mutation
  const mutation = useMutation({
    mutationFn: () =>
      patientsApi.updateMyProfile({
        fullName,
        dateOfBirth: dateOfBirth || null,
        gender: gender ? (gender as Gender) : null,
        mobile: mobile || null,
        email: email || null,
        city: city || null,
        bloodGroup: bloodGroup ? (bloodGroup as BloodGroup) : null,
        emergencyContactName: emergencyName || null,
        emergencyContactPhone: emergencyPhone || null,
        emergencyContactRelation: emergencyRelation || null,
        knownConditions: conditions,
        allergies,
        currentMedications: medications,
        pastSurgeries: surgeries,
        importantMedicalHistory: medicalHistory || null,
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(['patient-profile', user?.id], data);
      setSuccessMessage('Health profile updated and recorded in audit log');
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update profile');
      setSuccessMessage(null);
    },
  });

  // Chip Handlers
  const addChip = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputReset: () => void,
  ) => {
    if (value.trim() && !list.includes(value.trim())) {
      setter([...list, value.trim()]);
      inputReset();
    }
  };

  const removeChip = (
    index: number,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setter(list.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading patient health vault profile..." />;
  }

  const tabs = [
    { id: 'personal', label: 'Personal & Emergency' },
    { id: 'health', label: 'Conditions & Allergies', count: conditions.length + allergies.length },
    { id: 'medications', label: 'Medications & Surgeries', count: medications.length + surgeries.length },
    { id: 'history', label: 'Important History' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Health Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your accurate baseline health indicators and contact points.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          isLoading={mutation.isPending}
          leftIcon={<Save className="h-3.5 w-3.5" />}
        >
          Save Profile Changes
        </Button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <ErrorMessage
          title="Could not save profile"
          message={errorMessage}
          onRetry={() => mutation.mutate()}
        />
      )}

      {/* Tabs for progressive disclosure */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Personal & Emergency Information */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Personal Demographic Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                  <Input
                    label="Date of Birth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Gender Identity"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    options={[
                      { label: 'Select Gender', value: '' },
                      { label: 'Male', value: 'MALE' },
                      { label: 'Female', value: 'FEMALE' },
                      { label: 'Other', value: 'OTHER' },
                      { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
                    ]}
                  />

                  <Select
                    label="Blood Group"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}
                    options={[
                      { label: 'Select Blood Group', value: '' },
                      { label: 'A+ (A Positive)', value: 'A_POSITIVE' },
                      { label: 'A- (A Negative)', value: 'A_NEGATIVE' },
                      { label: 'B+ (B Positive)', value: 'B_POSITIVE' },
                      { label: 'B- (B Negative)', value: 'B_NEGATIVE' },
                      { label: 'AB+ (AB Positive)', value: 'AB_POSITIVE' },
                      { label: 'AB- (AB Negative)', value: 'AB_NEGATIVE' },
                      { label: 'O+ (O Positive)', value: 'O_POSITIVE' },
                      { label: 'O- (O Negative)', value: 'O_NEGATIVE' },
                      { label: 'Unknown', value: 'UNKNOWN' },
                    ]}
                  />

                  <Input
                    label="City / Locality"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Seattle"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Phone"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                  <Input
                    label="Primary Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emergency Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="Emergency Contact Name"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                    placeholder="e.g. Taylor Morgan"
                  />
                  <Input
                    label="Relationship"
                    value={emergencyRelation}
                    onChange={(e) => setEmergencyRelation(e.target.value)}
                    placeholder="e.g. Spouse / Sibling"
                  />
                  <Input
                    label="Emergency Phone"
                    type="tel"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    placeholder="+1 (555) 0188"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 2: Known Conditions & Allergies */}
        {activeTab === 'health' && (
          <div className="space-y-6">
            {/* Known Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Known Medical Conditions & Diagnoses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Chronic or active conditions (e.g. Hypertension, Type 2 Diabetes, Asthma).
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add condition..."
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChip(newCondition, conditions, setConditions, () => setNewCondition(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => addChip(newCondition, conditions, setConditions, () => setNewCondition(''))}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {conditions.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(index, conditions, setConditions)}
                        className="text-amber-700 hover:text-amber-950"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {conditions.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No medical conditions added.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Allergies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Allergies (Medications & Environmental)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Document any known adverse drug reactions, food allergies, or severe sensitivities.
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add allergy (e.g. Penicillin, Sulfa, Peanuts)..."
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChip(newAllergy, allergies, setAllergies, () => setNewAllergy(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => addChip(newAllergy, allergies, setAllergies, () => setNewAllergy(''))}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {allergies.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(index, allergies, setAllergies)}
                        className="text-rose-700 hover:text-rose-950"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {allergies.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No allergies added.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Current Medications & Past Surgeries */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Current Active Medications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Prescription or regular over-the-counter medications you are currently taking.
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Metformin 500mg (Daily), Lisinopril 10mg..."
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChip(newMedication, medications, setMedications, () => setNewMedication(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => addChip(newMedication, medications, setMedications, () => setNewMedication(''))}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {medications.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(index, medications, setMedications)}
                        className="text-teal-700 hover:text-teal-950"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {medications.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No medications recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Surgeries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Past Surgeries & Major Medical Procedures</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-slate-500">
                  Record past surgical interventions, hospitalizations, or invasive procedures.
                </p>

                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Appendectomy (2019), Arthroscopic Knee Surgery (2022)..."
                    value={newSurgery}
                    onChange={(e) => setNewSurgery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChip(newSurgery, surgeries, setSurgeries, () => setNewSurgery(''));
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => addChip(newSurgery, surgeries, setSurgeries, () => setNewSurgery(''))}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {surgeries.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-300 text-slate-800 text-xs font-medium"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeChip(index, surgeries, setSurgeries)}
                        className="text-slate-500 hover:text-slate-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {surgeries.length === 0 && (
                    <p className="text-xs text-slate-400 italic">No surgeries recorded.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 4: Important Medical Narrative History */}
        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Important Medical Narrative & Context</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-slate-500">
                Any family medical history, special instructions, or chronic symptoms that provide
                vital context during clinical encounters.
              </p>
              <textarea
                rows={6}
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="e.g. Maternal history of early-onset cardiovascular disease. Regular follow-up maintained with pulmonology every autumn."
                className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 text-xs sm:text-sm p-3 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 transition-colors"
              />
            </CardContent>
          </Card>
        )}

        {/* Submit Bar */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-400">
            Changes are saved to your secure health vault and audited.
          </p>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={mutation.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Save Health Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
