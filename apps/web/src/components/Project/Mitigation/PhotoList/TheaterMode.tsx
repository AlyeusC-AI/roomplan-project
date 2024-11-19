import {
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react'
import BlurImage from '@components/DesignSystem/BlurImage'
import { Dialog, Transition } from '@headlessui/react'
import useSupabaseImage from '@utils/hooks/useSupabaseImage'
import { RouterOutputs } from '@servicegeek/api'
import ParentSize from '@visx/responsive/lib/components/ParentSize'
import clsx from 'clsx'
import probe from 'probe-image-size'
import Image from 'next/image'

import Annotation from './Annotation'
import {
  XMarkIcon,
  PlusIcon,
  LinkIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'
import { team } from '@utils/scaffoldMockData'
import { useRecoilState } from 'recoil'
import projectInfoState from '@atoms/projectInfoState'
import { trpc } from '@utils/trpc'
import { useRouter } from 'next/router'
import Notes from '@components/Project/EstimateDetails/DetailsInput/Notes'
import { MentionMetadata } from '@components/DesignSystem/Mentions/useMentionsMetadata'

const TheaterModeSlideImage = ({
  photo,
  index,
  theaterModeIndex,
  onClick,
}: {
  photo: RouterOutputs['photos']['getProjectPhotos']['images'][0]
  theaterModeIndex: number
  index: number
  onClick: (i: number) => void
}) => {
  const supabaseUrl = useSupabaseImage(photo.key)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    if (index === theaterModeIndex) {
      ref.current.scrollIntoView()
    }
  }, [index, ref, theaterModeIndex])

  return (
    <div
      key={`${photo.key}-slide`}
      onClick={() => onClick(index)}
      ref={ref}
      className={clsx(
        index === theaterModeIndex ? 'border-green-500' : 'border-white',
        'group relative block h-[125px] w-[125px] cursor-pointer overflow-hidden rounded-lg border-4 bg-gray-100'
      )}
    >
      {supabaseUrl && <BlurImage sizes="125px" src={supabaseUrl} alt="" />}
    </div>
  )
}

export default function TheaterMode({
  open,
  setOpen,
  photos,
  theaterModeIndex,
  setTheaterModeIndex,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  photos: RouterOutputs['photos']['getProjectPhotos']['images']
  theaterModeIndex: number
  setTheaterModeIndex: Dispatch<SetStateAction<number>>
}) {
  const router = useRouter()
  const [projectInfo] = useRecoilState(projectInfoState)
  const supabaseUrl = useSupabaseImage(photos[theaterModeIndex].key)
  const [size, setSize] = useState<probe.ProbeResult | null>(null)
  const photoNotes = photos[theaterModeIndex].ImageNote
  const createPhotoNote = trpc.photos.createImageNote.useMutation()

  const handleAddProjectNote = async ({
    note,
    mentions,
    metadata,
  }: {
    note: string
    mentions: string[]
    metadata: MentionMetadata[]
  }) => {
    const res = await createPhotoNote.mutateAsync(
      {
        projectPublicId: router.query.id as string,
        body: note,
        imageId: photos[theaterModeIndex].id,
        mentions,
      },
      {
        onSettled: async (data) => {
          console.log('done')
        },
      }
    )
  }

  useEffect(() => {
    const updateSize = async () => {
      if (supabaseUrl) {
        const size = await probe(supabaseUrl)
        setSize(size)
      }
    }
    updateSize()
  }, [supabaseUrl])

  const onClick = (i: number) => {
    setTheaterModeIndex(i)
  }

  useEffect(() => {
    const keyHandler = ({ keyCode }: { keyCode: number }) => {
      if (keyCode === 37) {
        setTheaterModeIndex((prev) => (prev - 1 < 0 ? 0 : prev - 1))
      } else if (keyCode === 39) {
        setTheaterModeIndex((prev) =>
          prev + 1 > photos.length - 1 ? photos.length - 1 : prev + 1
        )
      }
    }
    window.addEventListener('keydown', keyHandler)

    return () => {
      window.removeEventListener('keydown', keyHandler)
    }
  }, [photos, setTheaterModeIndex])

  return (
    <Transition.Root show={open} // @ts-ignore
     as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child // @ts-ignore
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child // @ts-ignore
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative flex h-5/6 w-5/6 transform items-center justify-center overflow-hidden text-left transition-all">
                <div className="h-full w-full overflow-hidden rounded-lg bg-neutral-900 shadow-xl">
                  <div className="flex h-full w-full overflow-hidden rounded-lg bg-neutral-900 shadow-xl">
                    <div className="bg-cc-blue-900 relative flex h-full w-full items-center justify-center overflow-hidden align-middle">
                      {size && supabaseUrl && (
                        <Image
                          src={supabaseUrl}
                          width={size.width}
                          height={size.height}
                          alt=""
                        />
                      )}
                    </div>
                    <div className="w-2/4">
                      <form className=" h-full  overflow-y-scroll bg-white shadow-xl">
                        <div className="">
                          {/* Header */}
                          <div className="bg-gray-50 px-4 py-6 sm:px-6">
                            <div className="flex items-start justify-between space-x-3">
                              <div className="space-y-1">
                                <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                  {projectInfo?.name}
                                </Dialog.Title>
                                <p className="text-sm text-gray-500">
                                  {projectInfo?.location}
                                </p>
                              </div>
                              <div className="flex h-7 items-center">
                                <button
                                  type="button"
                                  className="text-gray-400 hover:text-gray-500"
                                  onClick={() => setOpen(false)}
                                >
                                  <span className="sr-only">Close panel</span>
                                  <XMarkIcon
                                    className="h-6 w-6"
                                    aria-hidden="true"
                                  />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Divider container */}
                          <div className="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0"></div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                          <Notes
                            notesData={photoNotes}
                            isLoading={false}
                            handleAddProjectNote={handleAddProjectNote}
                          />
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
