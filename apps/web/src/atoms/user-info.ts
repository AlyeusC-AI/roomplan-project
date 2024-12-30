import { create } from 'zustand'

export const defaultUserInfoState = undefined

interface State {
  user: UserInfo | undefined
}

interface Actions {
  setUser: (user: UserInfo) => void
  clearUser: () => void
}

export const userInfoStore = create<State & Actions>((set, get) => ({
  user: defaultUserInfoState,
  setUser: (user: UserInfo) => set((state) => ({ user })),
  clearUser: () => set({ user: defaultUserInfoState }),
}))
