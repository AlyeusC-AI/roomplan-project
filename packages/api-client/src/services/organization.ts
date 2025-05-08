import { createClient } from "./client";
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "../types/organization";
import { useAuthStore } from "./auth";

const client = createClient({
  getToken: async () => useAuthStore.getState().token,
});

export const organizationService = {
  create: (data: CreateOrganizationDto) => client.post("/organizations", data),

  update: (id: string, data: UpdateOrganizationDto) =>
    client.patch(`/organizations/${id}`, data),

  findAll: () => client.get("/organizations"),

  findOne: (id: string) => client.get(`/organizations/${id}`),

  remove: (id: string) => client.delete(`/organizations/${id}`),

  inviteMember: (orgId: string, data: { email: string }) =>
    client.post(`/organizations/${orgId}/invite`, data),

  acceptInvitation: (orgId: string, memberId: string) =>
    client.post(`/organizations/${orgId}/invitations/${memberId}/accept`),

  rejectInvitation: (orgId: string, memberId: string) =>
    client.post(`/organizations/${orgId}/invitations/${memberId}/reject`),

  removeMember: (orgId: string, memberId: string) =>
    client.delete(`/organizations/${orgId}/members/${memberId}`),

  getOrganizationMembers: (orgId: string) =>
    client.get(`/organizations/${orgId}/members`),
};
