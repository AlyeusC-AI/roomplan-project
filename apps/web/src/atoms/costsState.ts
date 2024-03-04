import { atom } from 'recoil'

export type CostDataType = {
  id: string
  name: string
  actualCost: number
  estimatedCost: number
}

export const subcontractorCostsState = atom<CostDataType[]>({
  key: 'SubcontractorCosts',
  default: [],
})

export const materialsCostsState = atom<CostDataType[]>({
  key: 'MaterialsCosts',
  default: [],
})

export const miscellaneousCostsState = atom<CostDataType[]>({
  key: 'MiscellaneousCosts',
  default: [],
})
export const laborCostsState = atom<CostDataType[]>({
  key: 'LaborCosts',
  default: [],
})
