import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { trpc } from '@utils/trpc'
import produce from 'immer'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { useRecoilState } from 'recoil'
import presignedUrlMapState from '@atoms/presignedUrlMapState'
import uploadInProgressImagesState from '@atoms/uploadInProgressImagesState'
import uploadSummaryState from '@atoms/uploadSummaryState'
import { v4 } from 'uuid'

import useAmplitudeTrack from './useAmplitudeTrack'
import useFilterParams from './useFilterParams'
import { ImageNote } from '@prisma/client'
const { pRateLimit } = require('p-ratelimit')

const NUM_ENDPOINTS = 6

const useUploader = (accessToken: string) => {
  const [, setUrlMap] = useRecoilState(presignedUrlMapState)

  const [uploadSummary, setUploadSummary] = useRecoilState(uploadSummaryState)
  const [, setUploadInProgressImages] = useRecoilState(
    uploadInProgressImagesState
  )
  const { track } = useAmplitudeTrack()

  const [numUploads, setIsNumUploads] = useState(0)
  const [completedUploads, setCompletedUploads] = useState(0)
  const [failedUploads, setFailedUploads] = useState<File[]>([])
  const router = useRouter()
  const supabase = useSupabaseClient()
  const user = useUser()
  const uploadIndex = useRef(0)
  const [trailEnded, setTrialEnded] = useState(false)
  const processMediaMutation = trpc.media.processMedia.useMutation()

  const trpcContext = trpc.useContext()
  const { rooms, onlySelected, sortDirection } = useFilterParams()

  const upload = async (files: File[] | FileList, roomId: string) => {
    if (trailEnded) {
      return
    }
    event('start_upload_images', {
      category: 'Estimate Page',
      count: files.length,
    })

    if (!files || files?.length === 0) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return
    }
    track('Upload Images', { count: files.length })

    setUploadSummary({})
    setIsNumUploads(files.length)
    setCompletedUploads(0)
    setFailedUploads([])
    const limit = pRateLimit({
      interval: 1000, // 1000 ms == 1 second
      rate: 30, // 10 API calls per interval
      concurrency: 30, // no more than 10 running at once
    })
    for (let i = 0; i < files.length; i++) {
      limit(() => uploadToSupabase(files[i], roomId))
    }
  }

  const onChange = async (e: ChangeEvent<HTMLInputElement>, roomId: string) => {
    // @ts-expect-error
    const imagesInFlight = Array.from(e.target.files).map((file) => {
      return {
        path: URL.createObjectURL(file),
        name: file.name,
      }
    })

    setUploadInProgressImages((oldUploadInProgressImages) => [
      ...oldUploadInProgressImages,
      ...imagesInFlight,
    ])
    // @ts-expect-error
    upload(e.target.files, roomId)
  }

  const onDrop = async (files: FileList, roomId: string) => {
    let imagesInFlight: {
      path: string
      name: string
    }[] = []
    for (let i = 0; i < files.length; i++) {
      imagesInFlight.push({
        path: URL.createObjectURL(files[i]),
        name: files[i].name,
      })
    }

    setUploadInProgressImages((oldUploadInProgressImages) => [
      ...oldUploadInProgressImages,
      ...imagesInFlight,
    ])
    upload(files, roomId)
  }

  const uploadToSupabase = async (file: File, roomId: string) => {
    try {
      const body = new FormData()
      body.append('file', file)
      if (trailEnded) {
        setTrialEnded(true)
        setCompletedUploads(0)
        setFailedUploads([])
        setIsNumUploads(0)
        setUploadInProgressImages([])
        return
      }
      const fileName = `${v4()}_${file.name}`
      await supabase.storage
        .from('media')
        .upload(`${user?.id}/${fileName}`, file, {
          contentType: file.type,
          upsert: false,
        })

      const response = await processMediaMutation.mutateAsync({
        fileName,
        projectPublicId: router.query.id as string,
        mediaType: 'photo',
        roomId,
      })

      if (failedUploads)
        setFailedUploads((prevFailedUploads) => [...prevFailedUploads, file])

      setUrlMap((p) => ({
        ...p,
        [decodeURIComponent(response.imageKey)]: response.signedUrl,
      }))
      const queryContext = {
        projectPublicId: router.query.id as string,
        sortDirection,
        rooms,
        onlySelected,
      }
      const prevData = trpcContext.photos.getProjectPhotos.getData(queryContext)
      trpcContext.photos.getProjectPhotos.setData(queryContext, {
        images: [
          // @ts-expect-error - this is a hack to get the types to work
          {
            key: response.imageKey,
            publicId: response.imagePublicId,
            createdAt: new Date(response.createdAt),
            includeInReport: false,
            inference: {
              publicId: response.publicId,
              room: {
                name: response.roomName,
                publicId: response.roomId,
              },
            },
          },
          ...(prevData?.images ? prevData.images : []),
        ],
      })

      setUploadSummary((prevUploadSummary) => {
        const nextState = produce(prevUploadSummary, (draft) => {
          if (draft[response.roomName]) {
            draft[response.roomName] = draft[response.roomName] + 1
          } else {
            draft[response.roomName] = 1
          }
        })
        return nextState
      })
      setCompletedUploads((prevCompletedUploads) => prevCompletedUploads + 1)

      setUploadInProgressImages((oldUploadInProgressImages) => [
        ...oldUploadInProgressImages.filter((image: any) => {
          return image.name !== file.name
        }),
      ])
    } catch (error) {
      console.log('failed', error)
      setFailedUploads((prevFailedUploads) => [...prevFailedUploads, file])
    }
  }

  useEffect(() => {
    if (
      numUploads > 0 &&
      completedUploads + failedUploads.length === numUploads
    ) {
      event('finish_upload_images', {
        category: 'Estimate Page',
        success_count: completedUploads,
        failed_count: failedUploads.length,
      })
      setCompletedUploads(0)
      setFailedUploads([])
      setIsNumUploads(0)
      setUploadInProgressImages([])
      trpcContext.photos.getProjectPhotos.invalidate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedUploads, failedUploads, numUploads])

  return {
    numUploads,
    onChange,
    onDrop,
    uploadSummary,
  }
}

export default useUploader
