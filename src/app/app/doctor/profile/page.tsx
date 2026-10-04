'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi, UpdateDoctorProfilePayload } from '@/lib/api/doctor';
import { useAuth } from '@/lib/auth-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDate } from '@/lib/utils';
import {
  Stethoscope,
  Save,
  CheckCircle2,
  Star,
  Award,
  ShieldCheck,
  Building,
  GraduationCap,
  FileCheck,
  AlertTriangle,
  Clock,
  Send,
  MapPin,
  Calendar,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Form states - Identity
  const [fullName, setFullName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('MALE');
  const [mobile, setMobile] = useState('');

  // Professional Information
  const [specialization, setSpecialization] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [languages, setLanguages] = useState('English, Hindi');
  const [yearsOfExperience, setYearsOfExperience] = useState(0);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [registrationAuthority, setRegistrationAuthority] = useState('');
  const [registrationState, setRegistrationState] = useState('');
  const [registrationCountry, setRegistrationCountry] = useState('India');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [bio, setBio] = useState('');
  const [medicalCertificate, setMedicalCertificate] = useState('');
  const [education, setEducation] = useState('');

  // Practice Information
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [city, setCity] = useState('');
  const [consultationMode, setConsultationMode] = useState('IN_PERSON');
  const [consultationFee, setConsultationFee] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Fetch Doctor's Own Profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['doctor-profile', user?.id],
    queryFn: () => doctorApi.getDoctorProfile(),
    enabled: !!user,
  });

  // 2. Fetch Doctor's Showcase with Reviews
  const { data: showcase, refetch: refetchShowcase } = useQuery({
    queryKey: ['doctor-showcase', user?.id],
    queryFn: () => doctorApi.getDoctorShowcase(user!.id),
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setProfilePhoto(profile.profilePhoto || '');
      setDateOfBirth(profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '');
      setGender(profile.gender || 'MALE');
      setMobile(profile.mobile || '');
      setSpecialization(profile.specialization || '');
      setSubSpecialty(profile.subSpecialty || '');
      setQualifications(profile.qualifications || '');
      setLanguages(profile.languages ? profile.languages.join(', ') : 'English, Hindi');
      setYearsOfExperience(profile.yearsOfExperience || 0);
      setLicenseNumber(profile.licenseNumber || '');
      setRegistrationNumber(profile.registrationNumber || profile.licenseNumber || '');
      setRegistrationAuthority(profile.registrationAuthority || '');
      setRegistrationState(profile.registrationState || '');
      setRegistrationCountry(profile.registrationCountry || 'India');
      setHospitalAffiliation(profile.hospitalAffiliation || '');
      setBio(profile.bio || '');
      setMedicalCertificate(profile.medicalCertificate || '');
      setEducation(profile.education || '');
      setClinicName(profile.clinicName || '');
      setClinicAddress(profile.clinicAddress || '');
      setCity(profile.city || '');
      setConsultationMode(profile.consultationMode || 'IN_PERSON');
      setConsultationFee(profile.consultationFee || '');
      setWorkingHours(profile.workingHours || '');
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateDoctorProfilePayload) =>
      doctorApi.updateDoctorProfile(payload),
    onSuccess: () => {
      setSuccessMessage('Physician profile updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      refetchShowcase();
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update profile.');
    },
  });

  const submitVerificationMutation = useMutation({
    mutationFn: () => doctorApi.submitForVerification(),
    onSuccess: () => {
      setSuccessMessage('Credentials submitted for administrative verification review.');
      queryClient.invalidateQueries({ queryKey: ['doctor-profile'] });
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Verification submission failed.');
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    updateMutation.mutate({
      fullName,
      profilePhoto: profilePhoto || undefined,
      dateOfBirth: dateOfBirth || undefined,
      gender: gender as any,
      mobile: mobile || undefined,
      specialization,
      subSpecialty: subSpecialty || undefined,
      qualifications: qualifications || undefined,
      languages: languages.split(',').map((s) => s.trim()).filter(Boolean),
      yearsOfExperience: Number(yearsOfExperience) || 0,
      licenseNumber: licenseNumber || undefined,
      registrationNumber: registrationNumber || undefined,
      registrationAuthority: registrationAuthority || undefined,
      registrationState: registrationState || undefined,
      registrationCountry: registrationCountry || undefined,
      hospitalAffiliation,
      bio,
      medicalCertificate: medicalCertificate || undefined,
      education,
      clinicName: clinicName || undefined,
      clinicAddress: clinicAddress || undefined,
      city: city || undefined,
      consultationMode,
      consultationFee,
      workingHours: workingHours || undefined,
    });
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading clinician profile & verification credentials..." />;
  }

  const vStatus = profile?.verificationStatus || 'PENDING';

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* 1. Verification Workflow Status Banner */}
      <div
        className={`rounded-xl p-5 border text-xs ${
          vStatus === 'VERIFIED'
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : vStatus === 'PENDING'
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : vStatus === 'REJECTED'
            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            {vStatus === 'VERIFIED' ? (
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : vStatus === 'PENDING' ? (
              <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm">
                  {vStatus === 'VERIFIED'
                    ? 'Verified Medical Practitioner'
                    : vStatus === 'PENDING'
                    ? 'Verification Status: Pending Review'
                    : vStatus === 'REJECTED'
                    ? 'Verification Requires Changes'
                    : 'Account Suspended'}
                </span>
                <Badge
                  variant={
                    vStatus === 'VERIFIED'
                      ? 'success'
                      : vStatus === 'PENDING'
                      ? 'warning'
                      : 'error'
                  }
                  size="sm"
                  dot
                >
                  {vStatus}
                </Badge>
              </div>

              <p className="text-slate-600 leading-relaxed max-w-2xl">
                {vStatus === 'VERIFIED'
                  ? `Your medical credentials and council registration have been verified by CarePath. Verified on ${
                      profile?.verifiedAt ? formatDate(profile.verifiedAt) : 'active'
                    }.`
                  : vStatus === 'PENDING'
                  ? `Your professional profile was submitted on ${
                      profile?.verificationSubmittedAt ? formatDate(profile.verificationSubmittedAt) : 'recently'
                    } and is currently under administrative audit. You can maintain your profile while review completes.`
                  : vStatus === 'REJECTED'
                  ? `Reason: ${profile?.rejectionReason || 'Professional registration information could not be verified'}. Please update your registration number and authority details below, then resubmit.`
                  : 'Your practitioner access is currently suspended. Please contact clinical support.'}
              </p>
            </div>
          </div>

          {vStatus !== 'VERIFIED' && (
            <Button
              size="sm"
              variant={vStatus === 'REJECTED' ? 'destructive' : 'primary'}
              isLoading={submitVerificationMutation.isPending}
              onClick={() => submitVerificationMutation.mutate()}
              leftIcon={<Send className="h-3.5 w-3.5" />}
            >
              {vStatus === 'REJECTED' ? 'Resubmit Verification' : 'Submit for Verification'}
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Main Grid: Edit Form (2/3) & Showcase Preview (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Identity & Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                1. Identity & Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <Input
                label="Full Legal Name & Title *"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Ahmed Khan, MD"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Contact Phone / Mobile"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                />

                <Input
                  label="Email (Registered Account)"
                  disabled
                  value={user?.email || ''}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Date of Birth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />

                <Select
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={[
                    { label: 'Male', value: 'MALE' },
                    { label: 'Female', value: 'FEMALE' },
                    { label: 'Other', value: 'OTHER' },
                    { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Professional Credentials & Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                2. Professional Credentials & Medical Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Primary Specialty *"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Internal Medicine, Cardiology"
                />

                <Input
                  label="Sub-Specialty"
                  value={subSpecialty}
                  onChange={(e) => setSubSpecialty(e.target.value)}
                  placeholder="e.g. Interventional Cardiology"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Qualifications & Degrees"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder="e.g. MBBS, MD (Med), DM, FRCP"
                />

                <Input
                  label="Years of Clinical Experience *"
                  type="number"
                  min="0"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Medical Registration / License Number *"
                  required
                  value={registrationNumber}
                  onChange={(e) => {
                    setRegistrationNumber(e.target.value);
                    setLicenseNumber(e.target.value);
                  }}
                  placeholder="e.g. MCI-2014-9842"
                />

                <Input
                  label="Registration Authority"
                  value={registrationAuthority}
                  onChange={(e) => setRegistrationAuthority(e.target.value)}
                  placeholder="e.g. Delhi Medical Council / State Board"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Registration State"
                  value={registrationState}
                  onChange={(e) => setRegistrationState(e.target.value)}
                  placeholder="e.g. Delhi / Maharashtra"
                />

                <Input
                  label="Languages Spoken"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  placeholder="e.g. English, Hindi, Punjabi"
                />
              </div>

              <Input
                label="Hospital / Medical Center Affiliation"
                value={hospitalAffiliation}
                onChange={(e) => setHospitalAffiliation(e.target.value)}
                placeholder="e.g. Apollo Hospitals / AIIMS New Delhi"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Professional Bio & Clinical Philosophy
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Describe your medical journey, diagnostic focus, clinical experience, and patient philosophy..."
                  className="block w-full rounded-md border border-slate-300 text-slate-900 bg-white text-xs p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700"
                />
              </div>
            </CardContent>
          </Card>

          {/* Practice & Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                3. Clinic & Practice Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Clinic / Practice Name"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. CarePath Health Center"
                />

                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                />
              </div>

              <Input
                label="Clinic Physical Address"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="e.g. Suite 402, Medical Enclave, Ring Road"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Consultation Mode"
                  value={consultationMode}
                  onChange={(e) => setConsultationMode(e.target.value)}
                  options={[
                    { label: 'In-person Clinic', value: 'IN_PERSON' },
                    { label: 'Video / Telehealth', value: 'VIDEO' },
                    { label: 'Hybrid (Both)', value: 'HYBRID' },
                  ]}
                />

                <Input
                  label="Consultation Fee (Indicator)"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="e.g. ₹800"
                />

                <Input
                  label="Working Hours"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  placeholder="e.g. Mon-Fri 09:00 - 17:00"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={updateMutation.isPending}
                  leftIcon={<Save className="h-4 w-4" />}
                >
                  Save Profile Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Right Column (1/3): Public Showcase Preview */}
        <div className="space-y-6">
          <Card className="border-teal-200 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-teal-900 to-slate-900 text-white rounded-t-lg p-5">
              <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                Public Verified Showcase
              </span>
              <CardTitle className="text-base text-white mt-1">
                {fullName || 'Dr. Physician'}
              </CardTitle>
              <p className="text-xs text-teal-200">
                {specialization || 'Clinical Specialist'}
              </p>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-slate-500">Patient Care Rating:</span>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-900">
                    {showcase?.averageRating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    ({showcase?.reviewCount || 0} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <Award className="h-4 w-4 text-teal-700 shrink-0" />
                  <span>
                    <strong>{yearsOfExperience} Years</strong> Clinical Practice
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Building className="h-4 w-4 text-teal-700 shrink-0" />
                  <span className="truncate">
                    {hospitalAffiliation || clinicName || 'CarePath Network'}
                  </span>
                </div>

                {city && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4 text-teal-700 shrink-0" />
                    <span>{city}</span>
                  </div>
                )}
              </div>

              {bio && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">About Physician:</span>
                  <p className="text-slate-600 leading-relaxed line-clamp-4">
                    {bio}
                  </p>
                </div>
              )}

              {/* Patient Reviews Preview */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="font-semibold text-slate-900 block text-xs">
                  Verified Patient Feedback ({showcase?.reviews?.length || 0})
                </span>

                {showcase?.reviews && showcase.reviews.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {showcase.reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{r.patientName}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(r.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                        {r.comment && (
                          <p className="text-slate-600 text-[11px] leading-relaxed">
                            {r.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">
                    No patient reviews recorded yet. Reviews will display here after consented patient encounters.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
