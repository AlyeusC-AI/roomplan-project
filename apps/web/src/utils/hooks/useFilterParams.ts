import {
  OnlySelectedFilterQueryParam,
  RoomsFilterQueryParam,
  SortDirectionQueryParam,
} from '@utils/types'
import { useRouter } from 'next/router'
import { z } from 'zod'

const useFilterParams = () => {
  const router = useRouter()
  const { rooms, onlySelected, sortDirection } = router.query

  let parsedRooms: z.infer<typeof RoomsFilterQueryParam> = undefined
  let parsedOnlySelected: z.infer<typeof OnlySelectedFilterQueryParam> =
    undefined
  let parsedSortDirection: z.infer<typeof SortDirectionQueryParam> = undefined

  if (rooms) {
    try {
      parsedRooms = RoomsFilterQueryParam.parse(JSON.parse(rooms as string))
    } catch (e) {
      console.error(e)
    }
  }

  if (onlySelected) {
    try {
      parsedOnlySelected = OnlySelectedFilterQueryParam.parse(
        JSON.parse(onlySelected as string)
      )
    } catch (e) {
      console.error(e)
    }
  }

  if (sortDirection) {
    try {
      parsedSortDirection = SortDirectionQueryParam.parse(sortDirection)
    } catch (e) {
      console.error(e)
    }
  }
  return {
    rooms: parsedRooms,
    onlySelected: parsedOnlySelected,
    sortDirection: parsedSortDirection,
  }
}

export default useFilterParams
