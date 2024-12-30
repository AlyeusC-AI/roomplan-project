import { useState } from 'react'
import { TertiaryButton } from '@components/components/button'
import Typeography from '@components/DesignSystem/Typeography'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { RoomData } from '@servicegeek/db/queries/project/getProjectDetections'

import SecureImage from './SecureImage'

const SecureRoomImages = ({ roomData }: { roomData: RoomData }) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleRow: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setIsOpen((o) => !o)
  }

  return (
    <div>
      <div>
        <div className="flex flex-row items-center">
          <TertiaryButton onClick={toggleRow} className="mr-2">
            {isOpen ? (
              // eslint-disable-next-line react/jsx-no-undef
              <ChevronDownIcon className="h-6 w-6 text-gray-800" />
            ) : (
              <ChevronUpIcon className="h-6 w-6 text-gray-800" />
            )}
          </TertiaryButton>
          <h3 className="py-4 text-2xl font-semibold">{roomData.name}</h3>
        </div>
        {isOpen && (
          <div className="flex flex-wrap gap-4">
            {roomData.inferences.length === 0 && (
              <div className="flex w-full items-center justify-center p-6">
                <Typeography.H6>
                  There are no images of this room.
                </Typeography.H6>
              </div>
            )}
            {roomData.inferences.map((inference) => (
              <SecureImage path={inference.imageKey} key={inference.imageKey} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default SecureRoomImages
