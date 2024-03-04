import { Dispatch, SetStateAction, useState } from 'react'
import inferencesState from '@atoms/inferencesState'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import Modal from '@components/DesignSystem/Modal'
import { useRecoilState } from 'recoil'
import roomState from '@atoms/roomState'

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
  const [roomList] = useRecoilState(roomState)

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
