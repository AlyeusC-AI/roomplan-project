import { Stakeholders } from '@servicegeek/db/queries/project/getUsersForProject'
import { create } from 'zustand'

// export const defaultStakeholderState = []

// const stakeholderState = atom<Stakeholders[]>({
//   key: 'StakeholderState',
//   default: defaultStakeholderState,
// })

// export default stakeholderState

interface State {
  stakeholders: Stakeholders[]
}

interface Actions {
  addStakeholder: (stakeholder: Stakeholders) => void
  removeStakeholder: (id: string) => void
}

export const stakeholderStore = create<State & Actions>((set) => ({
  stakeholders: [],
  addStakeholder: (stakeholder) =>
    set((state) => ({ stakeholders: [...state.stakeholders, stakeholder] })),
  removeStakeholder: (id) =>
    set((state) => ({
      stakeholders: state.stakeholders.filter((i) => i.userId !== id),
    })),
}))
