'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctorApi } from '../api/doctor';
import {
  DiscoverDoctorsParams,
  DoctorSearchResponse,
  DoctorPublicProfile,
  ConnectedDoctorItem,
  RelationshipHistoryItem,
  PreviouslyConsultedDoctorItem,
  DoctorSearchHistoryItem,
  DoctorConnectedPatientItem,
  DoctorPracticeLocation,
  RelationshipStatus,
} from '../api/types';

export function useDiscoverDoctors(params: DiscoverDoctorsParams) {
  return useQuery<DoctorSearchResponse>({
    queryKey: ['discover-doctors', params],
    queryFn: () => doctorApi.searchDoctors(params),
  });
}

export function useDoctorPublicProfile(doctorId?: string) {
  return useQuery<DoctorPublicProfile>({
    queryKey: ['doctor', doctorId],
    queryFn: () =>
      doctorId ? doctorApi.getDoctorPublicProfile(doctorId) : Promise.reject('No doctor ID'),
    enabled: !!doctorId,
  });
}

export function usePatientDoctors(status?: RelationshipStatus) {
  return useQuery<ConnectedDoctorItem[]>({
    queryKey: ['patient-doctors', status],
    queryFn: () => doctorApi.getPatientDoctors(status),
  });
}

export function usePreviouslyConsultedDoctors() {
  return useQuery<PreviouslyConsultedDoctorItem[]>({
    queryKey: ['previously-consulted-doctors'],
    queryFn: () => doctorApi.getPreviouslyConsultedDoctors(),
  });
}

export function usePatientRelationshipHistory() {
  return useQuery<RelationshipHistoryItem[]>({
    queryKey: ['doctor-relationship-history'],
    queryFn: () => doctorApi.getPatientRelationshipHistory(),
  });
}

export function useDoctorSearchHistory() {
  return useQuery<DoctorSearchHistoryItem[]>({
    queryKey: ['doctor-search-history'],
    queryFn: () => doctorApi.getPatientSearchHistory(),
  });
}

export function useDoctorConnectedPatients(search?: string) {
  return useQuery<DoctorConnectedPatientItem[]>({
    queryKey: ['doctor-connected-patients', search],
    queryFn: () => doctorApi.getDoctorConnectedPatients(search),
  });
}

export function useDoctorPracticeLocations() {
  return useQuery<DoctorPracticeLocation[]>({
    queryKey: ['doctor-practice-locations'],
    queryFn: () => doctorApi.getDoctorPracticeLocations(),
  });
}

export function useConnectDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      payload,
    }: {
      doctorId: string;
      payload?: { source?: string; notes?: string };
    }) => doctorApi.connectDoctor(doctorId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patient-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['discover-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['previously-consulted-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-relationship-history'] });
    },
  });
}

export function useReconnectDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => doctorApi.reconnectDoctor(doctorId),
    onSuccess: (_, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patient-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['discover-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['previously-consulted-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-relationship-history'] });
    },
  });
}

export function useDisconnectDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      payload,
    }: {
      doctorId: string;
      payload?: { reason?: string };
    }) => doctorApi.disconnectDoctor(doctorId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patient-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['discover-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['previously-consulted-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-relationship-history'] });
    },
  });
}

export function useBlockDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      doctorId,
      payload,
    }: {
      doctorId: string;
      payload?: { reason?: string };
    }) => doctorApi.blockDoctor(doctorId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', variables.doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patient-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['discover-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['previously-consulted-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-relationship-history'] });
    },
  });
}

export function useUnblockDoctor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (doctorId: string) => doctorApi.unblockDoctor(doctorId),
    onSuccess: (_, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['doctor', doctorId] });
      queryClient.invalidateQueries({ queryKey: ['patient-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['discover-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['previously-consulted-doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-relationship-history'] });
    },
  });
}

export function useClearSearchHistory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (historyId?: string) =>
      historyId
        ? doctorApi.deleteSearchHistoryItem(historyId)
        : doctorApi.clearAllSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-search-history'] });
    },
  });
}
