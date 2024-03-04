import { PropertyData } from '@lib/realty-mole/collectPropertyData'
import { atom } from 'recoil'

export type PropertyDataInfo = {
  bedrooms?: number | null
  bathrooms?: number | null
  squareFootage?: number | null
  data?: PropertyData
}

const propertyDataInfoState = atom<PropertyDataInfo>({
  key: 'PropertyDataInfoState',
  default: {},
})

export default propertyDataInfoState
