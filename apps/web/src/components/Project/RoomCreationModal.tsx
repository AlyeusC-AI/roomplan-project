import { Dispatch, SetStateAction, useMemo } from 'react'
import { useState } from 'react'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import TextInput from '@components/DesignSystem/TextInput'
import { Dialog } from '@headlessui/react'
import { HomeIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { useRecoilState } from 'recoil'
import inferencesState from '@atoms/inferencesState'
import roomState from '@atoms/roomState'

const RoomCreationModal = ({
  setOpen,
  isOpen,
}: {
  setOpen: Dispatch<SetStateAction<boolean>>
  isOpen: boolean
}) => {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [inferences, setInferences] = useRecoilState(inferencesState)
  const [rooms, setRooms] = useRecoilState(roomState)

  const roomNames = useMemo(
    () => inferences.map((room) => room.name),
    [inferences]
  )

  let errorWithInput = !!roomNames.find((v) => v === title) && isOpen
  let disabled = !title || errorWithInput
  const router = useRouter()

  const createRoom = async (room: string) => {
    event('attempt_create_room', {
      category: 'Estimate Page',
    })
    if (room.toLowerCase().trim() === 'automatic') return
    try {
      setLoading(true)
      const res = await fetch(`/api/project/${router.query.id}/room`, {
        method: 'POST',
        body: JSON.stringify({
          room,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setInferences((oldInferences) => [
          {
            publicId: json.publicId,
            detections: [],
            inferences: [],
            name: room,
          },
          ...oldInferences,
        ])
        setRooms((oldrooms) => [
          {
            publicId: json.publicId,
            name: room,
            areasAffected: [],
          },
          ...oldrooms,
        ])
        event('create_room', {
          category: 'Estimate Page',
          publicId: json.publicId,
        })
        setOpen(false)
      } else {
        setError('Could not create room')
      }
    } catch (error) {
      console.error(error)
      setError('Could not create room')
    }
    setLoading(false)
  }

  return (
    <>
      <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
        <button
          type="button"
          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-action focus:ring-offset-2"
          onClick={() => setOpen(false)}
        >
          <span className="sr-only">Close</span>
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 sm:mx-0 sm:h-10 sm:w-10">
          <HomeIcon
            className="h-6 w-6 text-primary-action"
            aria-hidden="true"
          />
        </div>
        <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
          <Dialog.Title
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            Add a new room
          </Dialog.Title>
          {error && (
            <Dialog.Description className=" font-medium leading-6 text-red-900">
              {error}
            </Dialog.Description>
          )}
          <div className="mt-2">
            <TextInput
              name="room-name"
              labelText="Room name"
              inputProps={{
                placeholder: 'Room Name',
                onKeyDown: (e) => {
                  if (e.key === 'Enter') {
                    if (disabled) return
                    createRoom(title)
                  }
                },
              }}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errorWithInput}
              errorText="A room with name already exists"
              required={true}
            />
          </div>
        </div>
      </div>
      <div className="mt-5 flex justify-end space-x-2">
        <SecondaryButton type="button" onClick={() => setOpen(false)}>
          Cancel
        </SecondaryButton>
        <PrimaryButton
          type="button"
          onClick={() => {
            if (disabled) return
            createRoom(title)
          }}
          disabled={disabled || loading}
          loading={loading}
        >
          Add Room
        </PrimaryButton>
      </div>
    </>
  )
}

export default RoomCreationModal
