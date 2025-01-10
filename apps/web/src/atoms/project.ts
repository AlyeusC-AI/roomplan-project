import { FileObject } from '@supabase/storage-js'
import { ProjectStatus } from '@servicegeek/db'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const defaultProjectInfoState = {
  clientName: '',
  clientEmail: '',
  clientPhoneNumber: '',
  location: '',
  name: '',
  managerName: '',
  companyName: '',
  insuranceCompanyName: '',
  adjusterName: '',
  adjusterPhoneNumber: '',
  adjusterEmail: '',
  insuranceClaimId: '',
  lossType: '',
  catCode: undefined,
  humidity: '',
  temperature: '',
  forecast: '',
  wind: '',
  lat: '',
  lng: '',
  claimSummary: '',
  assignmentNumber: '',
  status: ProjectStatus.active,
  roofSegments: [],
  roofSpecs: undefined,
  id: 0,
  publicId: ''
}

interface State {
  project: ProjectInfo
  projectFiles: FileObject[]
}

interface Actions {
  setProject: (project: ProjectInfo) => void
  removeFile: (name: string) => void
}

export const projectStore = create<State & Actions>()(
  persist(
    (set) => ({
      project: defaultProjectInfoState,
      projectFiles: [],
      setProject: (project) =>
        set((state) => ({ project: { ...state.project, ...project } })),
      removeFile: (name) =>
        set((state) => ({
          ...state,
          projectFiles: state.projectFiles.filter((file) => file.id !== name),
        })),
    }),
    {
      name: 'projectInfo',
    }
  )
)
