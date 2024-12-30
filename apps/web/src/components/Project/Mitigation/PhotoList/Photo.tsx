import ReactTooltip from 'react-tooltip'
import { TertiaryButton } from '@components/components/button'
import { CheckIcon, StarIcon } from '@heroicons/react/24/outline'
import { GroupByViews, PhotoViews } from '@servicegeek/db'
import useSupabaseImage from '@utils/hooks/useSupabaseImage'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@servicegeek/api'
import clsx from 'clsx'
import { format, formatDistance } from 'date-fns'
import produce from 'immer'
import { useRouter } from 'next/router'

import { QueryContext } from '.'

const Photo = ({
  photo,
  queryContext,
  groupBy,
  onPhotoClick,
  onSelectPhoto,
  selectedPhotos,
  photoView,
}: {
  photo: RouterOutputs['photos']['getProjectPhotos']['images'][0]
  selectedPhotos: RouterOutputs['photos']['getProjectPhotos']['images']
  queryContext: QueryContext
  groupBy: GroupByViews
  photoView: PhotoViews
  onPhotoClick: (key: string) => void
  onSelectPhoto: (
    photo: RouterOutputs['photos']['getProjectPhotos']['images'][0]
  ) => void
}) => {
  const supabaseUrl = useSupabaseImage(photo.key)
  const utils = trpc.useContext()
  const router = useRouter()

  const setIncludeInReport = trpc.photos.setIncludeInReport.useMutation({
    async onMutate({ includeInReport }) {
      await utils.photos.getProjectPhotos.cancel()
      const prevData = utils.photos.getProjectPhotos.getData(queryContext)
      const updatedData = produce(prevData, (draft) => {
        if (!draft) return draft
        const i = draft.images?.findIndex((p) => p.publicId === photo.publicId)
        if (i !== undefined && i >= 0) {
          draft.images[i].includeInReport = includeInReport
        }
        return draft
      })

      utils.photos.getProjectPhotos.setData(queryContext, updatedData)
      return { prevData }
    },
    onSettled(result) {
      utils.photos.getProjectPhotos.invalidate()
    },
  })

  const onToggle: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    setIncludeInReport.mutate({
      projectPublicId: router.query.id as string,
      includeInReport: !photo.includeInReport,
      imagePublicId: photo.publicId,
    })
  }
  const handleFlash = () => {
    const flash = document.getElementById('flash')
    if (flash) {
      flash.classList.remove('show')
      setTimeout(() => {
        flash.remove()
      }, 3000)
    }
  }

  if (!supabaseUrl) return null
  const isPhotoSelected = selectedPhotos.find((p) => p.key === photo.key)

  return (
    <>
      {photoView === PhotoViews.photoGridView ? (
        <div className="group relative">
          <div
            className="group relative block h-64 w-64 cursor-pointer overflow-hidden rounded-lg group-hover:bg-black"
            onClick={(e) => {
              e.stopPropagation()
              onPhotoClick(photo.key)
            }}
          >
            <div
              className={clsx(
                'absolute left-0 top-0 z-10 h-full w-full p-2',
                !isPhotoSelected && 'hidden bg-black/40 group-hover:flex',
                isPhotoSelected && 'bg-black/40'
              )}
            >
              <div
                className={clsx(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 shadow-lg',
                  isPhotoSelected && 'bg-primary-action'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onSelectPhoto(photo)
                }}
              >
                {isPhotoSelected && (
                  <CheckIcon className="h-6 w-6 text-white" />
                )}
              </div>
            </div>

            <img src={supabaseUrl} alt="" className="w-full" />
          </div>
          <div
            className={clsx(
              'w-full text-primary',
              groupBy === GroupByViews.roomView && 'py-2'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-1 flex-col justify-between ">
                {groupBy === GroupByViews.roomView && (
                  <div className="text-xs font-semibold ">
                    <p>
                      {format(
                        new Date(photo.createdAt),
                        "eee, MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
                <div className="text-xs">
                  {formatDistance(new Date(photo.createdAt), Date.now(), {
                    addSuffix: true,
                  })}
                  {photo?.ImageNote.length > 0 && (
                    <div className="text-xs">
                      {photo?.ImageNote.length} comments
                    </div>
                  )}
                </div>
              </div>
              <div>
                <TertiaryButton
                  noPadding
                  className="group flex h-10 w-10 cursor-pointer"
                  data-tip
                  data-for={photo.key}
                  onClick={onToggle}
                >
                  <StarIcon
                    className={clsx(
                      'h-6 w-6',
                      !photo.includeInReport && 'text-gray-500',
                      photo.includeInReport && 'fill-yellow-400 text-yellow-400'
                    )}
                  />
                </TertiaryButton>
                <ReactTooltip id={photo.key} place="bottom" effect="solid">
                  Toggle to show image in final Report{' '}
                </ReactTooltip>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className=" flex cursor-pointer border-b border-gray-300 py-2 px-2 hover:bg-slate-200"
          onClick={() => onSelectPhoto(photo)}
        >
          <div className="mr-2 flex items-center justify-center">
            <div
              className={clsx(
                'flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white shadow-lg',
                isPhotoSelected && 'bg-primary-action'
              )}
            >
              {isPhotoSelected && <CheckIcon className="h-4 w-4 text-white" />}
            </div>
          </div>
          <div
            className="group relative block h-12 w-12 cursor-pointer overflow-hidden rounded-lg"
            onClick={(e) => {
              e.stopPropagation()
              onPhotoClick(photo.key)
            }}
          >
            <img src={supabaseUrl} alt="" className="h-full w-auto" />
          </div>
          <div className="flex w-full flex-1 items-center justify-between">
            <div className="flex flex-col justify-start pl-8">
              <div className="text-sm font-semibold text-slate-500">
                {format(
                  new Date(photo.createdAt),
                  "eee, MMM d, yyyy 'at' h:mm a"
                )}
              </div>
              <div className="text-sm text-slate-500">
                {formatDistance(new Date(photo.createdAt), Date.now(), {
                  addSuffix: true,
                })}
              </div>
            </div>
            <div>
              <TertiaryButton
                noPadding
                className="group flex h-10 w-10 cursor-pointer"
                data-tip
                data-for={photo.key}
                onClick={onToggle}
              >
                <StarIcon
                  className={clsx(
                    'h-6 w-6',
                    !photo.includeInReport && 'text-gray-500',
                    photo.includeInReport && 'fill-yellow-400 text-yellow-400'
                  )}
                />
              </TertiaryButton>
              <ReactTooltip id={photo.key} place="bottom" effect="solid">
                Toggle to show image in final Report{' '}
              </ReactTooltip>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default Photo
