'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labApi, DiscoverLabsParams } from '../api/lab';
import {
  CanonicalTest,
  LabOrganization,
  LabLocation,
  LabCareConnection,
  LabCollectionMode,
  LabTestCategory,
  SelectLabForInvestigationPayload,
  ShareReportWithDoctorPayload,
} from '../api/types';
import { InvestigationRequest } from '../api/doctor';

export function usePatientInvestigations() {
  return useQuery<InvestigationRequest[]>({
    queryKey: ['patient-investigations'],
    queryFn: () => labApi.getPatientInvestigations(),
  });
}

export function useInvestigationDetail(id?: string) {
  return useQuery<InvestigationRequest>({
    queryKey: ['investigation', id],
    queryFn: () => (id ? labApi.getInvestigationById(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });
}

export function useDiscoverLabs(params: DiscoverLabsParams) {
  return useQuery({
    queryKey: ['discover-labs', params],
    queryFn: () => labApi.discoverLabs(params),
  });
}

export function useCompareLabs(
  investigationId?: string,
  params?: {
    latitude?: number;
    longitude?: number;
    collectionMode?: LabCollectionMode;
    sort?: string;
  },
) {
  return useQuery({
    queryKey: ['compare-labs', investigationId, params],
    queryFn: () =>
      investigationId
        ? labApi.compareLabsForInvestigation(investigationId, params)
        : Promise.reject('No investigation ID'),
    enabled: !!investigationId,
  });
}

export function useCanonicalTests(category?: LabTestCategory, search?: string) {
  return useQuery<CanonicalTest[]>({
    queryKey: ['canonical-tests', category, search],
    queryFn: () => labApi.listCanonicalTests({ category, search }),
  });
}

export function useLabProfile(labId?: string) {
  return useQuery<LabOrganization>({
    queryKey: ['lab-profile', labId],
    queryFn: () => (labId ? labApi.getLabProfile(labId) : Promise.reject('No lab ID')),
    enabled: !!labId,
  });
}

export function useLabLocations(labId?: string) {
  return useQuery<LabLocation[]>({
    queryKey: ['lab-locations', labId],
    queryFn: () => (labId ? labApi.listLabLocations(labId) : Promise.reject('No lab ID')),
    enabled: !!labId,
  });
}

export function useLabTests(labId?: string, category?: LabTestCategory) {
  return useQuery({
    queryKey: ['lab-tests', labId, category],
    queryFn: () => (labId ? labApi.listLabTests(labId, category) : Promise.reject('No lab ID')),
    enabled: !!labId,
  });
}

export function useLabCareConnection(connectionId?: string) {
  return useQuery<LabCareConnection>({
    queryKey: ['lab-care-connection', connectionId],
    queryFn: () =>
      connectionId
        ? labApi.getLabCareConnection(connectionId)
        : Promise.reject('No connection ID'),
    enabled: !!connectionId,
  });
}

export function useLabCareConnectionByOrder(orderId?: string) {
  return useQuery<LabCareConnection>({
    queryKey: ['lab-care-connection-by-order', orderId],
    queryFn: () =>
      orderId
        ? labApi.getLabCareConnectionByOrder(orderId)
        : Promise.reject('No order ID'),
    enabled: !!orderId,
  });
}

export function useSelectLabMutation(investigationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SelectLabForInvestigationPayload) =>
      labApi.selectLabForInvestigation(investigationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-investigations'] });
      queryClient.invalidateQueries({ queryKey: ['investigation', investigationId] });
      queryClient.invalidateQueries({ queryKey: ['compare-labs', investigationId] });
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    },
  });
}

export function useRevokeConnectionMutation(connectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason?: string) => labApi.revokeLabCareConnection(connectionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lab-care-connection', connectionId] });
      queryClient.invalidateQueries({ queryKey: ['lab-care-connection-by-order'] });
      queryClient.invalidateQueries({ queryKey: ['patient-investigations'] });
      queryClient.invalidateQueries({ queryKey: ['lab-orders'] });
    },
  });
}

export function useShareReportMutation(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ShareReportWithDoctorPayload) =>
      labApi.shareReportWithDoctor(reportId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      queryClient.invalidateQueries({ queryKey: ['lab-reports'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-reports-awaiting-review'] });
    },
  });
}
