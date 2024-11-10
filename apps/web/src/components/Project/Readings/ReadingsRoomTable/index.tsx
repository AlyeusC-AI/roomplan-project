import { useState } from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import Modal from '@components/DesignSystem/Modal'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { RoomDataWithoutInferences } from '@servicegeek/db/queries/project/getProjectDetections'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import { trpc } from '@utils/trpc'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { SetterOrUpdater } from 'recoil'

import Readings from './Readings'

const MitigationRoomTable = ({
  room,
  setRooms,
}: {
  room: RoomDataWithoutInferences
  setRooms: SetterOrUpdater<RoomDataWithoutInferences[]>
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const { track } = useAmplitudeTrack()
  const [internalRoomName, setInternalRoomName] = useState(room.name)
  const trpcContext = trpc.useContext()
  const [isCreating, setIsCreating] = useState(false)

  const router = useRouter()
  const addReadingMutation = trpc.readings.addReading.useMutation({
    async onSettled() {
      await trpcContext.readings.getAll.invalidate()
      setIsCreating(false)
    },
  })

  const updateRoomName = async () => {
    if (internalRoomName === '' || internalRoomName.trim() === '') return
    setIsSaving(true)
    track('Update Room Name')

    try {
      const res = await fetch(`/api/project/${router.query.id}/room-info`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: internalRoomName,
          roomId: room.publicId,
        }),
      })
      if (res.ok) {
        setRooms((oldRooms) => {
          const roomIndex = oldRooms.findIndex(
            (r) => r.publicId === room.publicId
          )
          const newState = [...oldRooms]
          newState[roomIndex] = {
            ...newState[roomIndex],
            name: internalRoomName.trim(),
          }
          return newState
        })
        setIsEditingTitle(false)
      }
    } catch (error) {
      console.log(error)
    }

    setIsSaving(false)
  }

  const deleteRoom = async () => {
    event('delete_room', {
      category: 'Estimate Page',
    })
    setIsDeleting(true)
    track('Delete Room')
    try {
      const res = await fetch(`/api/project/${router.query.id}/room`, {
        method: 'DELETE',
        body: JSON.stringify({
          roomId: room.publicId,
        }),
      })
      if (res.ok) {
        setRooms((oldRooms) => {
          let newState = [...oldRooms]
          newState = newState.filter((r) => r.publicId !== room.publicId)
          return newState
        })
      }
    } catch (error) {
      console.log(error)
    }
    setIsDeleting(false)
    setIsConfirmingDelete(false)
  }

  const addReading = async () => {
    setIsCreating(true)
    track('Add Room Reading')
    await addReadingMutation.mutateAsync({
      projectPublicId: router.query.id as string,
      roomPublicId: room.publicId,
    })
  }

  return (
    <div className="py-8 text-sm md:text-base">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {isEditingTitle ? (
            <>
              <input
                value={internalRoomName}
                onChange={(e) => setInternalRoomName(e.target.value)}
                className={`rounded-md border-slate-100 bg-white px-4 py-2 shadow-md ${
                  isSaving ? 'bg-slate-200' : ''
                }`}
                disabled={isSaving}
              />
              <SecondaryButton
                onClick={() => setIsEditingTitle(false)}
                className="ml-4"
                disabled={isSaving}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={() => updateRoomName()}
                className="ml-4"
                disabled={isSaving}
                loading={isSaving}
              >
                Save
              </PrimaryButton>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">
                {room.name}
              </h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className=" flex items-center justify-center px-4 py-2 text-slate-500 hover:text-primary "
              >
                <PencilIcon className="h-4" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center justify-center gap-4">
          <SecondaryButton loading={isCreating} onClick={() => addReading()}>
            Add Reading
          </SecondaryButton>
          <button
            className="text-slate-400 hover:text-red-600"
            onClick={() => setIsConfirmingDelete(true)}
          >
            <TrashIcon className="h-6" />
          </button>
        </div>
        <Modal open={isConfirmingDelete} setOpen={setIsConfirmingDelete}>
          {(setOpen) => (
            <>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Delete Room
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Permanently delete this room and everything associated
                    within it
                  </p>
                </div>
                <div className="mt-5 flex items-center space-x-4">
                  <SecondaryButton onClick={() => setIsConfirmingDelete(false)}>
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={() => deleteRoom()}
                    className=" !bg-red-100 text-red-700 hover:!bg-red-200"
                    loading={isDeleting}
                  >
                    Yes, delete the room.
                  </PrimaryButton>
                </div>
              </div>
            </>
          )}
        </Modal>
      </div>
      <Readings room={room} />
    </div>
  )
}

export default MitigationRoomTable
