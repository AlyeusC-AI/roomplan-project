import { useState } from 'react'
import toast from 'react-hot-toast'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { InferenceMetaData } from '@restorationx/db/queries/project/getProjectDetections'
import { saveAs } from 'file-saver'
import { useRecoilState } from 'recoil'
import presignedUrlMapState from '@atoms/presignedUrlMapState'
import projectInfoState from '@atoms/projectInfoState'

var JSZip = require('jszip')

const DownloadRoomImages = ({
  roomName,
  roomId,
  inferences,
}: {
  roomName: string
  roomId: string
  inferences: InferenceMetaData[]
}) => {
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

  const downloadImagesForRoom = async () => {
    setIsDownloading(true)
    const folderName = `${projectInfo.clientName
      .split(' ')
      .join('_')}_${roomName}_photos`
    const promises = []
    for (const inference of inferences) {
      promises.push(downloadImage(inference.imageKey))
    }
    var zip = new JSZip()
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
    zip
      .generateAsync({ type: 'blob' })
      .then(function (content: string | Blob) {
        saveAs(content, `${folderName}.zip`)
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
      onClick={() => downloadImagesForRoom()}
      loading={isDownloading}
    >
      <ArrowDownTrayIcon className="h-6" />
    </SecondaryButton>
  )
}

export default DownloadRoomImages
