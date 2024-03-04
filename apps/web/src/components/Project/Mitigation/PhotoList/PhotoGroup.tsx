/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { GroupByViews, PhotoViews } from '@restorationx/db'
import { RouterOutputs } from '@restorationx/api'
import clsx from 'clsx'

import Photo from './Photo'
import { QueryContext } from '.'

const PhotoGroup = ({
  photos,
  selectedPhotos,
  day,
  queryContext,
  groupBy,
  onPhotoClick,
  onSelectPhoto,
  photoView,
}: {
  photos: RouterOutputs['photos']['getProjectPhotos']['images']
  selectedPhotos: RouterOutputs['photos']['getProjectPhotos']['images']
  day: string
  queryContext: QueryContext
  groupBy: GroupByViews
  onPhotoClick: (key: string) => void
  onSelectPhoto: (
    photo: RouterOutputs['photos']['getProjectPhotos']['images'][0]
  ) => void
  photoView: PhotoViews
}) => {
  const [isOpen, setOpen] = useState(true)

  return (
    <div key={day} className="mt-4">
      <div className="flex ">
        <TertiaryButton noPadding onClick={() => setOpen((o) => !o)}>
          {isOpen ? (
            <ChevronDownIcon className="h-8 w-8" />
          ) : (
            <ChevronUpIcon className="h-8 w-8" />
          )}
        </TertiaryButton>
        <h2 className="ml-4 text-xl font-bold">{day}</h2>
      </div>
      {isOpen && (
        <div
          key={day}
          className={clsx(
            'mt-4 flex',
            photoView === PhotoViews.photoGridView &&
              'flex-wrap gap-x-4 gap-y-8',
            photoView === PhotoViews.photoListView && 'flex-col'
          )}
        >
          {photos.map((photo) => (
            <Photo
              selectedPhotos={selectedPhotos}
              key={photo.publicId}
              photo={photo}
              queryContext={queryContext}
              groupBy={groupBy}
              onPhotoClick={onPhotoClick}
              onSelectPhoto={onSelectPhoto}
              photoView={photoView}
            />
          ))}
          {photos.length === 0 && <p>There are no photos in this room</p>}
        </div>
      )}
    </div>
  )
}

export default PhotoGroup
