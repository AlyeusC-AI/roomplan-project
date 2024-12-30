import { PropertyData } from '@lib/realty-mole/collectPropertyData'
import { create } from 'zustand'

export type PropertyDataInfo = {
  bedrooms?: number | null
  bathrooms?: number | null
  squareFootage?: number | null
  data?: PropertyData
}

interface Actions {

}

export const propertyDataStore = create<PropertyDataInfo & Actions>(set => ({

}))

// const propertyDataInfoState = atom<PropertyDataInfo>({
//   key: 'PropertyDataInfoState',
//   default: {},
// })

// export default propertyDataInfoState
