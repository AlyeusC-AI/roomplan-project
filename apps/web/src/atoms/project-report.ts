import {
  AreaAffected,
  GenericRoomReading,
  Project,
  PropertyData,
  Room,
  RoomReading,
} from '@servicegeek/db'
import { create } from 'zustand'

export type ProjectReportData = Project & {
  propertyData: PropertyData | null
  rooms: (Room & {
    inferences: {
      imageKey: string
      publicId: string
      createdAt: Date
      image: {
        includeInReport: boolean
      }
    }[]
    areasAffected: AreaAffected[]
    roomReadings: (RoomReading & {
      genericRoomReadings: GenericRoomReading[]
    })[]
    notes: {
      publicId: string
      date: Date
      body: string
    }[]
  })[]
}
// const projectReportDataState = atom<ProjectReportData | null>({
//   key: 'ProjectReportDataState',
//   default: defaultProjectReportDataState,
// })

// export default projectReportDataState

interface State {
  projectReportData: ProjectReportData | null
}

interface Actions {
  setProjectReportData: (projectReportData: ProjectReportData) => void
}

export const projectReportStore = create<State & Actions>((set) => ({
  projectReportData: null,
  setProjectReportData: (projectReportData) =>
    set(() => ({ projectReportData })),
}))