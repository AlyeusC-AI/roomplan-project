import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import {
  organizationService,
  useOrganizationStore,
} from "../services/organization";
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Organization,
} from "../types/organization";
import { useAuthStore } from "../services/storage";

export function useActiveOrganization() {
  return useOrganizationStore((state) => state.activeOrganization);
}

export function useSetActiveOrganization() {
  return useOrganizationStore((state) => state.setActiveOrganization);
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const setActiveOrganization = useSetActiveOrganization();

  return useMutation({
    mutationFn: (data: CreateOrganizationDto) =>
      organizationService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      setActiveOrganization(response.data);
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateOrganizationDto }) =>
      organizationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useGetOrganizations() {
  const setActiveOrganization = useSetActiveOrganization();
  const activeOrg = useActiveOrganization();

  const options: UseQueryOptions<Organization[], Error> = {
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await organizationService.findAll();
      return response.data;
    },
    enabled: !!useAuthStore.getState().token,
  };

  const query = useQuery(options);

  // Handle setting active organization after query completes
  if (query.data && !activeOrg && query.data.length > 0 && query.data[0]) {
    setActiveOrganization(query.data[0]);
  }

  return query;
}

export function useGetOrganization(id: string) {
  return useQuery({
    queryKey: ["organizations", id],
    queryFn: () => organizationService.findOne(id),
    enabled: !!id,
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();
  const setActiveOrganization = useSetActiveOrganization();
  const activeOrganization = useActiveOrganization();
  const orgs = useGetOrganizations();
  return useMutation({
    mutationFn: (id: string) => {
      const response = organizationService.remove(id);
      if (id === activeOrganization?.id) {
        setActiveOrganization(
          orgs.data?.filter((org) => org.id !== id)[0] || null
        );
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, email }: { orgId: string; email: string }) =>
      organizationService.inviteMember(orgId, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationService.acceptInvitation(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationService.rejectInvitation(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationService.removeMember(orgId, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}

export function useGetOrganizationMembers(orgId: string) {
  return useQuery({
    queryKey: ["organizations", orgId, "members"],
    queryFn: () => organizationService.getOrganizationMembers(orgId),
    enabled: !!orgId,
  });
}
