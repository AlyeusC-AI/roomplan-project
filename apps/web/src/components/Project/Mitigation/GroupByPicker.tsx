import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import {
  CalendarIcon,
  ChevronDownIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { GroupByViews } from '@restorationx/db'
import { trpc } from '@utils/trpc'

import FilterLabel from './FilterLabel'

export default function GroupByPicker() {
  const utils = trpc.useContext()
  const groupView = trpc.groupView.getGroupView.useQuery()
  const setPhotoView = trpc.groupView.setGroupView.useMutation({
    async onMutate({ view }) {
      await utils.groupView.getGroupView.cancel()
      const prevData = utils.groupView.getGroupView.getData()
      utils.groupView.getGroupView.setData(undefined, { groupView: view })
      return { prevData, view }
    },
    onError(err, _, ctx) {
      if (ctx?.prevData)
        utils.groupView.getGroupView.setData(undefined, ctx.prevData)
    },
    onSettled(result) {
      utils.groupView.getGroupView.invalidate()
    },
  })
  const isRoomView = groupView.data?.groupView === GroupByViews.roomView

  const onClick = () => {
    setPhotoView.mutate({
      view:
        groupView.data?.groupView === GroupByViews.roomView
          ? GroupByViews.dateView
          : GroupByViews.roomView,
    })
  }

  return (
    <div className="flex flex-col">
      <FilterLabel>Group By</FilterLabel>
      <SecondaryButton onClick={onClick}>
        {!isRoomView ? (
          <>
            <CalendarIcon className="mr-2 h-5 w-5" />
            Date
          </>
        ) : (
          <>
            <HomeIcon className="mr-2 h-5 w-5" />
            Room
          </>
        )}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </SecondaryButton>
    </div>
  )
}
