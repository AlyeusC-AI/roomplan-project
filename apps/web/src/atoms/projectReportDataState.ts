import {
  AreaAffected,
  GenericRoomReading,
  Project,
  PropertyData,
  Room,
  RoomReading,
} from '@servicegeek/db'
import { atom } from 'recoil'

export const defaultProjectReportDataState = null

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
const projectReportDataState = atom<ProjectReportData | null>({
  key: 'ProjectReportDataState',
  default: defaultProjectReportDataState,
})

export default projectReportDataState
