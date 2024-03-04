import { Dispatch, SetStateAction } from 'react'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import {
  ChevronDownIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import { PhotoViews } from '@restorationx/db'
import { trpc } from '@utils/trpc'

import FilterLabel from './FilterLabel'

export default function ViewPicker({
  photoView,
  setPhotoView,
}: {
  photoView: PhotoViews
  setPhotoView: Dispatch<SetStateAction<PhotoViews>>
}) {
  const utils = trpc.useContext()
  const setPhotoViewMutation = trpc.photoView.setPhotoView.useMutation({
    async onMutate({ view }) {
      await utils.photoView.getPhotoView.cancel()
      const prevData = utils.photoView.getPhotoView.getData()
      utils.photoView.getPhotoView.setData(undefined, { photoView: view })
      return { prevData, view }
    },
    onError(err, _, ctx) {
      if (ctx?.prevData)
        utils.photoView.getPhotoView.setData(undefined, ctx.prevData)
    },
    onSettled(result) {
      utils.photoView.getPhotoView.invalidate()
    },
  })
  const isGridView = photoView === PhotoViews.photoGridView

  const onClick = () => {
    const newPhotoView =
      photoView === PhotoViews.photoGridView
        ? PhotoViews.photoListView
        : PhotoViews.photoGridView
    setPhotoViewMutation.mutate({
      view:
        photoView === PhotoViews.photoGridView
          ? PhotoViews.photoListView
          : PhotoViews.photoGridView,
    })
    setPhotoView(newPhotoView)
  }

  return (
    <div className="flex flex-col">
      <FilterLabel>Switch View</FilterLabel>
      <SecondaryButton onClick={onClick}>
        {!isGridView ? (
          <>
            <Squares2X2Icon className="mr-2 h-5 w-5" />
            Grid View
          </>
        ) : (
          <>
            <ListBulletIcon className="mr-2 h-5 w-5" />
            List View
          </>
        )}
        <ChevronDownIcon className="ml-2 h-4 w-4" />
      </SecondaryButton>
    </div>
  )
}
