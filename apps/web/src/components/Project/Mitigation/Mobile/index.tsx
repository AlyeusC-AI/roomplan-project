import Success from '@components/DesignSystem/Alerts/Success'
import PrimaryLink from '@components/DesignSystem/Links/PrimaryLink'
import Pill from '@components/DesignSystem/Pills/Pill'
import { CameraIcon, FolderIcon } from '@heroicons/react/24/outline'
import useUploader from '@utils/hooks/useUploader'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import inferencesState from '@atoms/inferencesState'

import OptimisticUploadUI from '../../OptimisticUploadUI'

import MobileRoomImageList from './MobileRoomImageList'

const Mobile = ({ accessToken }: { accessToken: string }) => {
  const [inferences] = useRecoilState(inferencesState)
  const { onChange, uploadSummary } = useUploader(accessToken)
  const router = useRouter()

  return (
    <div>
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold">Upload Photos</h1>
        <div className="text-md mt-2">
          Allowed file types are <Pill color="blue">PNG</Pill> or{' '}
          <Pill color="green">JPG</Pill>
        </div>
      </div>
      <div className="mt-10 mb-6 w-full">
        <PrimaryLink
          href={`${router.asPath}/upload`}
          className="h-20 w-full text-xl"
        >
          <CameraIcon className="mr-4 h-10" /> Take Pictures
        </PrimaryLink>
      </div>
      <div className="w-full">
        <label
          htmlFor="mobile-input"
          className="group inline-flex h-16 w-full items-center justify-center rounded-md border border-blue-600 px-2 py-1 text-sm font-medium text-primary shadow-sm hover:cursor-pointer hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto md:px-4 md:py-2"
        >
          <FolderIcon className="mr-4 h-10 text-primary group-hover:text-white group-focus:text-white" />
          <div>Upload images</div>
        </label>
        <input
          multiple
          type="file"
          accept=".jpg, .jpeg, .png"
          id="mobile-input"
          name="mobile-input"
          className="hidden"
          onChange={(e) => {
            onChange(e, 'automatic')
          }}
        />
      </div>
      <OptimisticUploadUI />
      {Object.keys(uploadSummary).length > 0 && (
        <Success title="Upload Successful">
          <ul>
            {Object.keys(uploadSummary).map((room) => (
              <li key={`upload-summary-${room}`}>
                {uploadSummary[room]} image(s) added to room: {room}
              </li>
            ))}
          </ul>
        </Success>
      )}
      <div>
        {inferences.map((room) => (
          <MobileRoomImageList key={room.publicId} room={room} />
        ))}
      </div>
    </div>
  )
}

export default Mobile
