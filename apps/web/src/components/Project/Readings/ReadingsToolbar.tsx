import { useState } from 'react'
import { PrimaryButton } from '@components/components/button'
import Modal from '@components/DesignSystem/Modal'

import RoomCreationModal from '../RoomCreationModal'
import TabTitleArea from '../TabTitleArea'

export default function MitigationToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false)

  return (
    <TabTitleArea
      title="Readings"
      description="Record humidity, gpp, and temperature readings from each room within the job site."
    >
      <>
        <div></div>
        <PrimaryButton onClick={() => setIsRoomCreationModalOpen(true)}>
          Add Room
        </PrimaryButton>
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
      </>
    </TabTitleArea>
  )
}
