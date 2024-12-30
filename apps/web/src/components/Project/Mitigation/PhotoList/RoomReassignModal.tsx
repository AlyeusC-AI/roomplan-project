import { Dispatch, SetStateAction, useState } from 'react'
import { PrimaryButton } from '@components/components'
import Modal from '@components/DesignSystem/Modal'
import {roomStore} from '@atoms/room'

const RoomReassignModal = ({
  open,
  setOpen,
  onReassign,
  loading,
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  onReassign: (roomId: string) => void
  loading: boolean
}) => {
  const roomList = roomStore(state => state.rooms)

  const [internalValue, setInternalValue] = useState('')
  const [value, setValue] = useState('')
  return (
    <Modal open={open} setOpen={setOpen}>
      {() => (
        <div>
          <h3 className="text-xl font-medium">Assign images to a new room</h3>
          <div className="mt-4 flex w-full flex-col items-center gap-4">
            <select
              id="selectRoom"
              name="selectRoom"
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              defaultValue="select-a-room"
              onChange={(e) => {
                setValue(e.target.value)
                setInternalValue(e.target.value)
              }}
            >
              <option value="select-a-room" disabled>
                Select a room
              </option>

              {roomList.map((room) => (
                <option key={room.name} value={room.publicId}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <PrimaryButton
              onClick={() => {
                onReassign(value)
                setInternalValue('')
              }}
              disabled={!internalValue}
              loading={loading}
            >
              Reassign Room
            </PrimaryButton>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default RoomReassignModal
