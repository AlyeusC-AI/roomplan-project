import { useState } from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import Modal from '@components/DesignSystem/Modal'

import RoomCreationModal from '../RoomCreationModal'
import TabTitleArea from '../TabTitleArea'

export default function NotesToolbar() {
  const [isRoomCreationModalOpen, setIsRoomCreationModalOpen] = useState(false)

  return (
    <TabTitleArea title="Notes" description="Record notes for each room.">
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
