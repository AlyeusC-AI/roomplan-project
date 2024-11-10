import { Member } from '@components/Settings/Organization/types'
import { Stakeholders } from '@servicegeek/db/queries/project/getUsersForProject'
import { atom, selector } from 'recoil'

export const defaultTeamMembersState = []

const teamMembersState = atom<Member[]>({
  key: 'TeamMembersState',
  default: defaultTeamMembersState,
})

export const teamMembersAsStakeHolders = selector({
  key: 'TeamMembersAsStakeHolders',
  get: ({ get }) => {
    return get(teamMembersState).map((m) => ({
      userId: m.user.id,
      user: {
        email: m.user.email,
        firstName: m.user.firstName || '',
        lastName: m.user.lastName || '',
        phone: m.user.phone || '',
      },
    })) as Stakeholders[]
  },
})

export default teamMembersState
