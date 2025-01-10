import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const defaultUserInfoState = undefined

interface State {
  user: UserInfo | undefined
}

interface Actions {
  setUser: (user: UserInfo) => void
  clearUser: () => void
}

export const userInfoStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      user: defaultUserInfoState,
      setUser: (user: UserInfo) => set((state) => ({ user })),
      clearUser: () => set({ user: defaultUserInfoState }),
    }),
    {
      name: 'userInfo',
    }
  )
)
