/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { ScaleLoader } from 'react-spinners'
import inferencesState from '@atoms/inferencesState'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import EmptyState from '@components/DesignSystem/EmptyState'
import { GroupByViews, PhotoViews } from '@restorationx/db'
import useFilterParams from '@utils/hooks/useFilterParams'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'
import { format } from 'date-fns'
import produce from 'immer'
import { useRecoilState } from 'recoil'

import PhotoGroup from './PhotoGroup'
import RoomReassignModal from './RoomReassignModal'
import TheaterMode from './TheaterMode'
import { group } from 'console'
import roomState from '@atoms/roomState'

export type QueryContext = {
  projectPublicId: string
  rooms: string[] | undefined
  onlySelected: boolean | undefined
  sortDirection: 'asc' | 'desc' | undefined
}

export type GroupedPhotos = {
  [key: string]: RouterOutputs['photos']['getProjectPhotos']['images']
}

const PhotoList = ({
  photos,
  queryContext,
  groupBy,
  photoView,
}: {
  photos?: RouterOutputs['photos']['getProjectPhotos']['images']
  queryContext: QueryContext
  groupBy: GroupByViews
  photoView: PhotoViews
}) => {
  const [theaterModeIndex, setTheaterModeIndex] = useState(0)
  const [isTheaterMode, setIsTheaterMode] = useState(false)
  const [isRoomReassignOpen, setIsRoomReassignOpen] = useState(false)
  const [inferences] = useRecoilState(inferencesState)
  const { rooms, onlySelected } = useFilterParams()
  const [roomList] = useRecoilState(roomState)

  const [selectedPhotos, setSelectedPhotos] = useState<
    RouterOutputs['photos']['getProjectPhotos']['images']
  >([])

  const trpcContext = trpc.useContext()

  const deletePhotoMutation = trpc.photos.deleteProjectPhotos.useMutation({
    async onMutate({ photoIds }) {
      await trpcContext.photos.getProjectPhotos.cancel()
      const prevData = trpcContext.photos.getProjectPhotos.getData(queryContext)
      trpcContext.photos.getProjectPhotos.setData(queryContext, (old) => {
        const updated = old?.images?.filter(
          (p) => !photoIds.some((id) => id === p.publicId)
        )
        return { images: updated || [] }
      })
      return { prevData }
    },
    onSettled() {
      trpcContext.photos.getProjectPhotos.invalidate()
    },
  })

  const setRoomForProjectPhotosMutation =
    trpc.photos.setRoomForProjectPhotos.useMutation({
      async onMutate({ photoKeys, roomId }) {
        await trpcContext.photos.getProjectPhotos.cancel()
        const prevData =
          trpcContext.photos.getProjectPhotos.getData(queryContext)
        const newRoom = inferences.find((room) => room.publicId === roomId)
        trpcContext.photos.getProjectPhotos.setData(queryContext, (old) => {
          const updated = produce(old, (draft) => {
            if (!old || !draft) return
            try {
              for (let i = 0; i < old.images?.length; i++) {
                if (photoKeys.find((key) => key === old.images[i].key)) {
                  if (old.images[i] && old.images[i].inference && newRoom) {
                    draft.images[i] = {
                      ...old.images[i],
                      ...(old.images[i].inference !== null && {
                        inference: {
                          // @ts-expect-error
                          publicId: old.images[i].inference.publicId,
                          room: {
                            name: newRoom.name,
                            publicId: newRoom?.publicId,
                          },
                        },
                      }),
                    }
                  }
                }
              }
            } catch (e) {
              // something went horribly wrong
              console.error(e)
              location.reload()
              return
            }
          })
          return updated
        })
        return { prevData }
      },
      onSettled() {
        trpcContext.photos.getProjectPhotos.invalidate()
      },
    })

  const onPhotoClick = (key: string) => {
    const photoIndex = photos?.findIndex((p) => p.key === key)
    if (photoIndex !== undefined && photoIndex >= 0) {
      setTheaterModeIndex(photoIndex)
      setIsTheaterMode(true)
    }
  }

  if (!photos) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <ScaleLoader color="#2563eb" />
      </div>
    )
  }

  if (photos.length === 0 && (rooms || onlySelected)) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <EmptyState
          title="No photos match your filter criteria"
          imagePath="/images/void.svg"
          description="Try removing a few options"
          height={1038}
          width={995}
        />
      </div>
    )
  }

  let grouped: GroupedPhotos
  if (groupBy === GroupByViews.dateView) {
    grouped = photos.reduce((prev, photo) => {
      const day = format(new Date(photo.createdAt), 'eee, MMM d, yyyy')
      return {
        ...prev,
        // @ts-expect-error
        [day]: [...(prev[day] ? prev[day] : []), photo],
      }
    }, {}) as GroupedPhotos
  } else {
    grouped = photos.reduce((prev, photo) => {
      const room = photo.inference?.room?.name || 'Unknown room'
      return {
        ...prev,
        // @ts-expect-error
        [room]: [...(prev[room] ? prev[room] : []), photo],
      }
    }, {}) as GroupedPhotos
    if (!rooms) {
      for (let i = 0; i < roomList.length; i++) {
        if (!grouped[roomList[i].name]) {
          grouped[roomList[i].name] = []
        }
      }
    }
  }

  const onSelectPhoto = (
    photo: RouterOutputs['photos']['getProjectPhotos']['images'][0]
  ) => {
    const photoIndex = selectedPhotos.findIndex((p) => p.key === photo.key)
    if (photoIndex === undefined || photoIndex === -1) {
      setSelectedPhotos((prev) => [...prev, photo])
      return
    } else if (photoIndex >= 0) {
      setSelectedPhotos((prev) =>
        produce(prev, (draft) => {
          const prevIndex = prev.findIndex((p) => p.key === photo.key)
          if (prevIndex >= 0) {
            draft.splice(prevIndex, 1)
          }
        })
      )
    }
  }

  const onDelete = async () => {
    // FILTER HERE IN CASE OF DRIFT
    const photoIds = selectedPhotos
      .map((p) => p.publicId)
      .filter((p) => photos.some((o) => o.publicId === p))
    await deletePhotoMutation.mutateAsync({
      projectPublicId: queryContext.projectPublicId,
      photoIds,
    })
    setSelectedPhotos([])
  }

  const onUpdateRoom = async (roomId: string) => {
    // FILTER HERE IN CASE OF DRIFT
    const photoKeys = selectedPhotos
      .map((p) => p.key)
      .filter((p) => photos.some((o) => o.key === p))
    await setRoomForProjectPhotosMutation.mutateAsync({
      projectPublicId: queryContext.projectPublicId,
      photoKeys,
      roomId,
    })
    setSelectedPhotos([])
    setIsRoomReassignOpen(false)
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      {selectedPhotos.length > 0 && (
        <div
          className="fixed top-0 left-44 z-20 flex justify-between bg-primary-action p-6 shadow-lg"
          style={{
            width: 'calc(100% - 11rem)',
          }}
        >
          <div className="flex gap-4">
            <SecondaryButton onClick={() => setIsRoomReassignOpen(true)}>
              Assign Room
            </SecondaryButton>
            <SecondaryButton
              onClick={onDelete}
              disabled={deletePhotoMutation.isLoading}
            >
              Delete Image(s)
            </SecondaryButton>
          </div>
          <div>
            <SecondaryButton onClick={() => setSelectedPhotos([])}>
              Close
            </SecondaryButton>
          </div>
        </div>
      )}
      <RoomReassignModal
        open={isRoomReassignOpen}
        setOpen={setIsRoomReassignOpen}
        onReassign={onUpdateRoom}
        loading={setRoomForProjectPhotosMutation.isLoading}
      />
      {isTheaterMode && (
        <TheaterMode
          open={isTheaterMode}
          setOpen={setIsTheaterMode}
          photos={photos}
          theaterModeIndex={theaterModeIndex}
          setTheaterModeIndex={setTheaterModeIndex}
        />
      )}
      {Object.keys(grouped).map((day) => (
        <PhotoGroup
          key={day}
          day={day}
          photos={grouped[day]}
          queryContext={queryContext}
          groupBy={groupBy}
          onPhotoClick={onPhotoClick}
          onSelectPhoto={onSelectPhoto}
          selectedPhotos={selectedPhotos}
          photoView={photoView}
        />
      ))}
    </div>
  )
}

export default PhotoList
