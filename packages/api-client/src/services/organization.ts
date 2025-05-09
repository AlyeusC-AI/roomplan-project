import { createClient } from "./client";
import type {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  Organization,
} from "../types/organization";
import { useAuthStore } from "./storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const client = createClient({
  getToken: async () => useAuthStore.getState().token,
});

interface OrganizationState {
  activeOrganization: Organization | null;
  setActiveOrganization: (org: Organization | null) => void;
  clearActiveOrganization: () => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      activeOrganization: null,
      setActiveOrganization: (org) => set({ activeOrganization: org }),
      clearActiveOrganization: () => set({ activeOrganization: null }),
    }),
    {
      name: "organization-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

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
