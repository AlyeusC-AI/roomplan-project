import { RoomDataWithoutInferences } from '@restorationx/db/queries/project/getProjectDetections'
import { atom } from 'recoil'

export const defaultRoomState = []
const roomState = atom<RoomDataWithoutInferences[]>({
  key: 'RoomState',
  default: defaultRoomState,
})

export default roomState
