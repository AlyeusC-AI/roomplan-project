import {
  carrierOptions,
  floorOptions,
  wallOptions,
} from '@components/DesignSystem/CreationSelect/carrierOptions'
import { atom } from 'recoil'

export const defaultSavedOptionState = {
  carrier: carrierOptions,
  wallMaterial: wallOptions,
  floorMaterial: floorOptions,
}

export interface Option {
  readonly label: string
  readonly value: string
  readonly publicId?: string
}

export type SavedOptionsState = {
  carrier: Option[]
  wallMaterial: Option[]
  floorMaterial: Option[]
}

const savedOptionsState = atom<SavedOptionsState>({
  key: 'SavedOptionsState',
  default: defaultSavedOptionState,
})

export default savedOptionsState
