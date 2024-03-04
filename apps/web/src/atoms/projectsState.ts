import { ProjectType } from '@restorationx/db/queries/project/listProjects'
import { atom } from 'recoil'

export const defaultInferencesState = []

const projectsState = atom<ProjectType[]>({
  key: 'ProjectsState',
  default: defaultInferencesState,
})

export default projectsState
