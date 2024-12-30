import { create } from 'zustand'

export const defaultOrgInfoState = {
  name: '',
  number: '',
  address: '',
  publicId: '',
  logoId: '',
}

interface State {
  organization: OrgInfo
}

interface Actions {
  setOrganization: (organization: OrgInfo) => void
  updateLogoId: (logoId: string) => void
  setOrg: (org: OrgInfo) => void
}

export const orgStore = create<State & Actions>((set) => ({
  organization: defaultOrgInfoState,
  setOrganization: (organization) => set(() => ({ organization })),
  updateLogoId: (logoId) =>
    set((state) => ({
      organization: { ...state.organization, logoId },
    })),
  setOrg: (org) => set(() => ({ organization: org })),
}))
