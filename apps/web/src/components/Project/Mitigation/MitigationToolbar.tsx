import { useState } from 'react'
import { Fragment } from 'react'
import subscriptionStatusState from '@atoms/subscriptionStatusState'
import Success from '@components/DesignSystem/Alerts/Success'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import Modal from '@components/DesignSystem/Modal'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { SubscriptionStatus } from '@servicegeek/db'
import useUploader from '@utils/hooks/useUploader'
import clsx from 'clsx'
import { event } from 'nextjs-google-analytics'
import { useRecoilState } from 'recoil'

import CreateAccessLink from '../CreateAccessLink'
import DownloadAllRoomImages from '../DownloadAllRoomImages'
import ImageUploadModal from '../ImageUploadModal'
import RoomCreationModal from '../RoomCreationModal'
import TabTitleArea from '../TabTitleArea'

function UploadButton({
  onPrimaryClick,
  onSecondaryClick,
  disabled,
}: {
  onPrimaryClick: () => void
  onSecondaryClick: () => void
  disabled: boolean
}) {
  return (
    <div className="inline-flex rounded-md shadow-sm">
      <PrimaryButton
        onClick={onPrimaryClick}
        type="button"
        disabled={disabled}
        className="relative inline-flex items-center rounded-l-md rounded-r-none shadow-none"
      >
        Upload Images
      </PrimaryButton>
      <Menu as="div" className="relative -ml-px block">
        <Menu.Button className="group relative inline-flex h-full items-center rounded-r-md border-l border-gray-300 bg-primary-action px-2 py-2 text-sm font-medium text-gray-500 hover:bg-primary-action-hover hover:shadow-md focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary-action ">
          <span className="sr-only">Open options</span>
          <ChevronDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </Menu.Button>
        <Transition // @ts-ignore
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right  rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onSecondaryClick}
                  disabled={disabled}
                  className={clsx(
                    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                    'block w-full px-4 py-2 text-sm'
                  )}
                >
                  Upload to room
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  )
}

export default function MitigationToolbar({
  accessToken,
}: {
  accessToken: string
}) {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false)
  const [isImageUploadModalOpen, setIsImageUploadModalOpen] = useState(false)
  const [directImageUpload, setIsDirectImageUpload] = useState(true)
  const [subscriptionStatus] = useRecoilState(subscriptionStatusState)

  const { numUploads, onChange, uploadSummary, onDrop } =
    useUploader(accessToken)

  const onClick = () => {
    event('attempt_upload_images', {
      category: 'Estimate Page',
    })
  }

  const onPrimaryClick = () => {
    setIsImageUploadModalOpen(true)
    setIsDirectImageUpload(true)
  }

  const onSecondaryClick = () => {
    setIsImageUploadModalOpen(true)
    setIsDirectImageUpload(false)
  }

  return (
    <div>
      <TabTitleArea
        title="Upload Photos"
        id="upload-photos-title"
        description="Upload photos of the job site. Take photos easily right from your phone or upload directly from your computer."
      >
        <>
          <UploadButton
            onPrimaryClick={onPrimaryClick}
            onSecondaryClick={onSecondaryClick}
            disabled={
              !(
                subscriptionStatus === SubscriptionStatus.trialing ||
                subscriptionStatus === SubscriptionStatus.active
              )
            }
          />
          <Modal
            open={isImageUploadModalOpen}
            setOpen={setIsImageUploadModalOpen}
          >
            {(setOpen) => (
              <ImageUploadModal
                onChange={onChange}
                onClick={onClick}
                isUploading={numUploads > 0}
                setOpen={setOpen}
                directImageUpload={directImageUpload}
                onDrop={onDrop}
              />
            )}
          </Modal>
          <SecondaryButton onClick={() => setIsRoomCreationModalOpen(true)}>
            Add Room
          </SecondaryButton>
          <Modal
            open={isRoomCreationModalOpen}
            setOpen={setIsRoomCreationModalOpen}
          >
            {(setOpen) => (
              <RoomCreationModal
                setOpen={setOpen}
                isOpen={isRoomCreationModalOpen}
              />
            )}
          </Modal>
          <CreateAccessLink />
          <DownloadAllRoomImages />
        </>
      </TabTitleArea>
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
    </div>
  )
}
