import { Stakeholders } from '@servicegeek/db/queries/project/getUsersForProject'
import produce from 'immer'
import { create } from 'zustand'

interface State {
  teamMembers: Member[]
}

interface Actions {
  addTeamMember: (member: Member) => void
  removeTeamMember: (id: string) => void
  changeAccessLevel: (id: string, accessLevel: string) => void
  getTeamMembersAsStakeHolders: () => Stakeholders[]
}

export const teamMembersStore = create<State & Actions>((set, get) => ({
  teamMembers: [],
  addTeamMember: (member) =>
    set((state) => ({ teamMembers: [...state.teamMembers, member] })),
  removeTeamMember: (id) =>
    set((state) => ({
      teamMembers: state.teamMembers.filter((i) => i.user.id !== id),
    })),
  changeAccessLevel: (id, accessLevel) =>
    set(
      produce((draft) => {
        const memberIndex = draft.findIndex(
          (m) => m.user.id === id
        )

        draft[memberIndex] = {
          ...draft[memberIndex],
          accessLevel: accessLevel,
        }
      })
    ),
    getTeamMembersAsStakeHolders: () => get().teamMembers.map((m) => ({
        userId: m.user.id || '',
        user: {
          email: m.user.email || '',
          firstName: m.user.firstName || '',
          lastName: m.user.lastName || '',
          phone: m.user.phone || '',
        },
      }))
}))
