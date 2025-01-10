import { ProjectType } from '@servicegeek/db/queries/project/listProjects'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// export const defaultInferencesState = []

// const projectsState = atom<ProjectType[]>({
//   key: 'ProjectsState',
//   default: defaultInferencesState,
// })

// export default projectsState
interface State {
  projects: ProjectType[]
}

interface Actions {
  addProject: (project: ProjectType) => void
  removeProject: (id: string) => void
  setProjects: (projects: ProjectType[]) => void
}

export const projectsStore = create<State & Actions>()(
  persist(
    (set) => ({
      projects: [],
      addProject: (project) =>
        set((state) => ({ projects: [...state.projects, project] })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((i) => i.publicId !== id),
        })),
      setProjects: (projects) => set(() => ({ projects })),
    }),
    {
      name: 'projects',
    }
  )
)
