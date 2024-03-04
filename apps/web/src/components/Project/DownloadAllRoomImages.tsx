import { useState } from 'react'
import toast from 'react-hot-toast'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { InferenceMetaData } from '@restorationx/db/queries/project/getProjectDetections'
import { saveAs } from 'file-saver'
import { useRecoilState } from 'recoil'
import inferencesState from '@atoms/inferencesState'
import presignedUrlMapState from '@atoms/presignedUrlMapState'
import projectInfoState from '@atoms/projectInfoState'

var JSZip = require('jszip')

const DownloadAllRoomImages = () => {
  const [allInferences] = useRecoilState(inferencesState)
  const [isDownloading, setIsDownloading] = useState(false)
  const [projectInfo] = useRecoilState(projectInfoState)
  const [presignedUrlMap] = useRecoilState(presignedUrlMapState)

  const downloadImage = async (imageKey: string) => {
    try {
      const res = await fetch(presignedUrlMap[decodeURIComponent(imageKey)])
      if (res.ok) {
        return res.blob()
      }
    } catch (error) {
      return null
    }
  }

  const downloadImagesForRoom = async (
    zip: any,
    roomName: string,
    inferences: InferenceMetaData[]
  ) => {
    setIsDownloading(true)
    const folderName = `${roomName}_photos`
    const promises = []
    for (const inference of inferences) {
      promises.push(downloadImage(inference.imageKey))
    }
    const roomFolder = zip.folder(folderName)

    const resolved = await Promise.all(promises)
    let index = 1
    for (const resolvedPromise of resolved) {
      if (!resolvedPromise) continue
      const blob = resolvedPromise as Blob
      const mimeType = blob.type
      let extension = '.png'
      if (mimeType === 'jpg' || mimeType === 'jpeg') {
        extension = '.jpeg'
      }
      roomFolder.file(`${roomName}_${index}${extension}`, blob, {
        base64: true,
      })
      index++
    }
    return
  }

  const downloadAllImagesForRoom = async () => {
    var zip = new JSZip()

    const promises = []

    for (const inference of allInferences) {
      promises.push(
        downloadImagesForRoom(zip, inference.name, inference.inferences)
      )
    }

    await Promise.all(promises)

    zip
      .generateAsync({ type: 'blob' })
      .then(function (content: string | Blob) {
        saveAs(
          content,
          `${projectInfo.clientName.split(' ').join('_')}_photos.zip`
        )
        setIsDownloading(false)
      })
      .catch((e: any) => {
        console.error(e)
        setIsDownloading(false)
        toast.error(
          'Failed to download images. Please contact support@restorationx.app if this error persists'
        )
      })
  }
  return (
    <SecondaryButton
      onClick={() => downloadAllImagesForRoom()}
      loading={isDownloading}
      className="sm:w-full md:w-auto"
    >
      <ArrowDownTrayIcon className="h-6" />
    </SecondaryButton>
  )
}

export default DownloadAllRoomImages
