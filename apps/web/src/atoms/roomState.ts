import { RoomDataWithoutInferences } from '@servicegeek/db/queries/project/getProjectDetections'
import { atom } from 'recoil'

export const defaultRoomState = []
const roomState = atom<RoomDataWithoutInferences[]>({
  key: 'RoomState',
  default: defaultRoomState,
})

export default roomState
