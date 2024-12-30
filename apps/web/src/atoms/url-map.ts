import { create } from 'zustand'

type State = {
  urlMap: PresignedUrlMap
}

type Actions = {
  addUrlMap: (key: string, url: string) => void
  setUrlMap: (urlMap: PresignedUrlMap) => void  
}

export const urlMapStore = create<State & Actions>((set) => ({
  urlMap: {},
  addUrlMap: (key, url) =>
    set((state) => ({ urlMap: { ...state.urlMap, ...{ [key]: url } } })),
  setUrlMap: (urlMap) => set({ urlMap }),
}))
