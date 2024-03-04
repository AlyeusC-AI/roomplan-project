import { Equipment } from '@restorationx/db'
import { atom } from 'recoil'

export type EquipmentStateType = Omit<Equipment, 'id' | 'organizationId'>

const equipmentState = atom<EquipmentStateType[]>({
  key: 'EquipmentState',
  default: [],
})

export default equipmentState
