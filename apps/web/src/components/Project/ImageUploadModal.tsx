import { ChangeEvent, Dispatch, SetStateAction, useMemo, useState } from 'react'
import { FileUploader } from 'react-drag-drop-files'
import {
  PrimaryButton,
  TertiaryButton,
  TextInput,
} from '@components/components'
import { ArrowRightIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { UNKNOWN_ROOM } from '@lib/image-processing/constants'
import useAmplitudeTrack from '@utils/hooks/useAmplitudeTrack'
import { useRouter } from 'next/router'
import { event } from 'nextjs-google-analytics'
import { inferencesStore } from '@atoms/inferences'

const ImageUploadModal = ({
  onChange,
  isUploading,
  onClick,
  onDrop,
  setOpen,
  directImageUpload = true,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>, roomId: string) => void
  onDrop: (files: FileList, roomId: string) => void
  isUploading: boolean
  onClick: () => void
  setOpen: Dispatch<SetStateAction<boolean>>
  directImageUpload?: boolean
}) => {
  const inferences = inferencesStore((state) => state.inferences)
  const [internalValue, setInternalValue] = useState('')
  const [value, setValue] = useState('')
  const [isCreatingNewRoom, setIsCreatingNewRoom] = useState(false)
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [error, setError] = useState('')
  const { track } = useAmplitudeTrack()

  const roomNames = useMemo(
    () => inferences.map((room) => room.name),
    [inferences]
  )
  let errorWithInput = !!roomNames.find((v) => v === title)
  let disabled = !title || errorWithInput

  const createRoom = async () => {
    if (title.toLowerCase().trim() === 'automatic') return
    if (title.toLowerCase().trim() === '') return
    event('attempt_create_room', {
      category: 'Estimate Page',
    })
    setLoading(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/room`, {
        method: 'POST',
        body: JSON.stringify({
          room: title,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        track('Created Room', { roomId: json.publicId })
        inferencesStore.getState().addInference({
          publicId: json.publicId,
          detections: [],
          inferences: [],
          name: title,
        })
        event('create_room', {
          category: 'Estimate Page',
          publicId: json.publicId,
        })
        setTitle('')
        setIsCreatingNewRoom(false)
        setValue(json.publicId)
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
    <div>
      <div className="mb-4 flex items-center justify-between ">
        <h1 className="text-xl font-medium">Upload Images</h1>
        {!directImageUpload && (
          <>
            {roomNames.length > 0 && (
              <>
                {isCreatingNewRoom ? (
                  <TertiaryButton
                    noPadding
                    disabled={loading}
                    onClick={() => {
                      setTitle('')
                      setIsCreatingNewRoom(false)
                    }}
                  >
                    Upload to existing room
                  </TertiaryButton>
                ) : (
                  <TertiaryButton
                    noPadding
                    onClick={() => setIsCreatingNewRoom(true)}
                  >
                    Create a new room <ArrowRightIcon className="ml-2 w-4" />
                  </TertiaryButton>
                )}
              </>
            )}
          </>
        )}
      </div>
      {!directImageUpload && (
        <div className="mb-4">
          <div>
            {isCreatingNewRoom || roomNames.length === 0 ? (
              <label
                htmlFor="createRoom"
                className="block text-sm font-medium text-gray-700"
              >
                Create New Room
              </label>
            ) : (
              <label
                htmlFor="selectRoom"
                className="block text-sm font-medium text-gray-700"
              >
                Select Room
              </label>
            )}
          </div>
          <div className="mt-2 flex gap-3">
            {isCreatingNewRoom || roomNames.length === 0 ? (
              <div className="w-full flex-col">
                <div className="flex gap-3">
                  <TextInput
                    includeLabel={false}
                    name="room-name"
                    labelText="Room name"
                    inputProps={{
                      placeholder: 'Room Name',
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') {
                          if (disabled) return
                          createRoom()
                        }
                      },
                    }}
                    containerClass="w-full"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    error={errorWithInput}
                    required={true}
                  />
                  <PrimaryButton
                    disabled={loading || errorWithInput || title === ''}
                    className="!w-40"
                    onClick={() => createRoom()}
                    loading={loading}
                  >
                    Add Room
                  </PrimaryButton>
                </div>
                {errorWithInput && (
                  <p className="mt-2 text-sm text-red-600">
                    A room with name already exists
                  </p>
                )}
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-4">
                <select
                  id="selectRoom"
                  name="selectRoom"
                  className=" block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  value={internalValue}
                  onChange={(e) => {
                    const inference = inferences.find(
                      (i) => i.name === e.target.value
                    )
                    if (inference) {
                      setValue(inference?.publicId)
                      setInternalValue(e.target.value)
                    }
                  }}
                >
                  <option value="" disabled selected>
                    Select a room
                  </option>
                  {inferences.map((room) => (
                    <option key={room.name} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {((roomNames.length > 0 && !isCreatingNewRoom) || directImageUpload) && (
        <FileUploader
          disabled={directImageUpload ? false : !internalValue}
          handleChange={(files: FileList) => {
            onDrop(files, directImageUpload ? UNKNOWN_ROOM : value)
            setOpen(false)
          }}
          name="file"
          types={['jpg', 'jpeg', 'png']}
          multiple
          classes="border-2 rounded-md cursor-pointer border-dashed border-primary-action !h-36 !flex !items-center !justify-center"
        >
          <div className="flex flex-col items-center justify-center">
            <ArrowUpTrayIcon className="mb-4 h-10 w-10 text-primary-action" />
            Select or drop files here
            <div className="mt-4 text-xs">(jpg, jpeg, png)</div>
          </div>
        </FileUploader>
      )}
    </div>
  )
}

export default ImageUploadModal
