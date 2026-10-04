import { api } from './client';
import { PatientProfile } from './types';

export type UpdatePatientPayload = Partial<
  Omit<PatientProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export const patientsApi = {
  getMyProfile: () => api.get<PatientProfile>('/patients/me'),
  updateMyProfile: (payload: UpdatePatientPayload) =>
    api.patch<PatientProfile>('/patients/me', payload),
};
