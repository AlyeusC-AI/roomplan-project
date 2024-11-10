import { useState } from 'react'
import Success from '@components/DesignSystem/Alerts/Success'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import Modal from '@components/DesignSystem/Modal'
import { ClipboardIcon, ShareIcon } from '@heroicons/react/24/outline'
import { AccessLinkExpiration } from '@servicegeek/utils/types'
import { useRouter } from 'next/router'

const expirationOptions = {
  [AccessLinkExpiration.ONE_HOUR]: '1 Hour',
  [AccessLinkExpiration.ONE_DAY]: '1 Day',
  [AccessLinkExpiration.SEVEN_DAYS]: '7 Days',
  [AccessLinkExpiration.FOURTEEN_DAYS]: '14 Days',
  [AccessLinkExpiration.THIRTY_DAYS]: '30 Days',
  [AccessLinkExpiration.NEVER]: 'never',
}

const CreateAccessLink = () => {
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [didCopy, setDidCopy] = useState(false)

  const [selectedOption, setSelectedOption] = useState(
    AccessLinkExpiration.SEVEN_DAYS
  )
  const [accessLinkId, setAccessLinkId] = useState('')
  const router = useRouter()

  const onClick = () => {
    setIsCreating(true)
  }

  const onClose = () => {
    setAccessLinkId('')
    setDidCopy(false)
    setIsCreating(false)
  }

  const onCreateLink = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/project/${router.query.id}/create-access-link`,
        {
          method: 'POST',
          body: JSON.stringify({
            expiresAt: selectedOption,
          }),
        }
      )
      if (res.ok) {
        const json = await res.json()
        setAccessLinkId(json.linkId)
      }
    } catch (error) {
      console.error(error)
    }
    setIsLoading(false)
  }

  const getLinkUrl = () =>
    `https://www.servicegeek.app/secure-view/${accessLinkId}`

  const onCopyClick = () => {
    navigator.clipboard.writeText(getLinkUrl())
    setDidCopy(true)
  }
  return (
    <>
      <SecondaryButton
        className="sm:w-full md:w-auto"
        onClick={() => onClick()}
      >
        <ShareIcon className="h-6" />
      </SecondaryButton>
      <Modal open={isCreating} setOpen={onClose}>
        {() => (
          <div>
            {accessLinkId ? (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Link Created
                </h3>
                <p className="my-2">
                  Click the link below to copy it to your clipboard
                </p>
                <div
                  onClick={() => onCopyClick()}
                  className="flex cursor-pointer items-center justify-between rounded-sm border border-gray-300 text-sm shadow-sm hover:bg-gray-300 hover:shadow-md"
                >
                  <div className=" w-5/6 overflow-hidden text-ellipsis whitespace-nowrap p-3">
                    {getLinkUrl()}
                  </div>
                  <div className=" flex items-center justify-center border-l border-gray-300 p-3">
                    <ClipboardIcon className="h-6" />
                  </div>
                </div>
                {didCopy && <Success title="Copied to clipboard!" />}
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Create Access Link
                </h3>
                <p className="my-2">
                  To create a secure link to share with anyone, select an
                  expiration date for your link and copy the generated link.
                  Once a link expires the contents will no longer be accessible.
                </p>
                <p className="my-2">
                  {' '}
                  Viewers with a link will be able to view:
                </p>
                <ol className="list-disc pl-8">
                  <li>Client Name & Address</li>
                  <li>Adjuster Name & Email</li>
                  <li>All photos</li>
                </ol>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="mt-4 mr-4 font-medium">Expires at:</p>
                    <select
                      defaultValue={selectedOption}
                      placeholder="Select Expiration Time"
                      className="rounded-md shadow-md"
                      onChange={(e) =>
                        setSelectedOption(
                          e.target.value as AccessLinkExpiration
                        )
                      }
                    >
                      {Object.keys(expirationOptions).map((v) => (
                        <option key={v} value={v}>
                          {expirationOptions[v as AccessLinkExpiration]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <PrimaryButton
                    onClick={() => onCreateLink()}
                    loading={isLoading}
                  >
                    Create Link
                  </PrimaryButton>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  )
}

export default CreateAccessLink
