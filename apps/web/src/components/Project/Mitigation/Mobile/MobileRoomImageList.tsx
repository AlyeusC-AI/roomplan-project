import { useState } from 'react'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import Typeography from '@components/DesignSystem/Typeography'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { RoomData } from '@servicegeek/db/queries/project/getProjectDetections'

import MobileImage from './MobileImage'

const MobileRoomImageList = ({ room }: { room: RoomData }) => {
  const [isOpen, setIsOpen] = useState(true)
  const toggleRow = () => {
    setIsOpen((o) => !o)
  }
  return (
    <div key={room.publicId}>
      <div className=" mt-8 flex items-center">
        <TertiaryButton onClick={toggleRow} className="mr-2">
          {isOpen ? (
            <ChevronDownIcon className="h-6 w-6 text-gray-800" />
          ) : (
            <ChevronUpIcon className="h-6 w-6 text-gray-800" />
          )}
        </TertiaryButton>
        <h2 className="text-xl font-bold">{room.name}</h2>
      </div>
      {isOpen && (
        <div className="mt-2 flex flex-wrap">
          {room.inferences.length === 0 && (
            <Typeography.Base className="mt-2 ml-12">
              There are no photos of this room
            </Typeography.Base>
          )}
          {room.inferences.map((inference) => {
            if (!inference.imageKey) return null
            return (
              <div key={inference.publicId} className="m-2">
                <MobileImage
                  imageURL={inference.imageKey}
                  createdAt={inference.createdAt}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MobileRoomImageList
