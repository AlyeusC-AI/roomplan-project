import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import TextareaAutosize from 'react-textarea-autosize'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import Spinner from '@components/Spinner'
import { TrashIcon } from '@heroicons/react/24/outline'
import { Notes, NotesAuditTrail } from '@restorationx/db'
import clsx from 'clsx'
import { format, formatDistance } from 'date-fns'
import produce from 'immer'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import roomState from '@atoms/roomState'

const Note = ({
  roomPublicId,
  note,
}: {
  roomPublicId: string
  note: Notes & { notesAuditTrail: NotesAuditTrail[] }
}) => {
  const [loading, setLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [, setRooms] = useRecoilState(roomState)

  const router = useRouter()
  const onSave = async (body: string) => {
    try {
      const res = await fetch(`/api/project/${router.query.id}/room-note`, {
        method: 'PATCH',
        body: JSON.stringify({
          roomId: roomPublicId,
          body,
          noteId: note.publicId,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setRooms((oldRooms) => {
          return produce(oldRooms, (draft) => {
            const roomIndex = draft.findIndex(
              (r) => r.publicId === roomPublicId
            )
            if (roomIndex < 0 || !draft[roomIndex]) return draft

            const noteIndex = draft[roomIndex].notes?.findIndex(
              (n) => n.publicId === note.publicId
            )
            if (noteIndex === undefined || noteIndex < 0) return draft
            // @ts-expect-error
            draft[roomIndex].notes[noteIndex].updatedAt = json.result.updatedAt
            // @ts-expect-error
            draft[roomIndex].notes[noteIndex].notesAuditTrail =
              json.result.notesAuditTrail
            return draft
          })
        })
      } else {
        console.error('Failed to save room note')
      }
    } catch (error) {
      console.log(error)
    }
  }

  const onDeleteNote = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/room-note`, {
        method: 'DELETE',
        body: JSON.stringify({
          roomId: roomPublicId,
          noteId: note.publicId,
        }),
      })
      if (res.ok) {
        setRooms((oldRooms) => {
          return produce(oldRooms, (draft) => {
            const roomIndex = draft.findIndex(
              (r) => r.publicId === roomPublicId
            )
            if (roomIndex < 0 || !draft[roomIndex]) return draft

            const noteIndex = draft[roomIndex].notes?.findIndex(
              (n) => n.publicId === note.publicId
            )
            if (noteIndex === undefined || noteIndex < 0) return draft
            draft[roomIndex].notes?.splice(noteIndex, 1)
            return draft
          })
        })
      } else {
        console.error('Failed to delete room readings')
      }
    } catch (error) {
      console.log(error)
      toast.error('Failed to delete note.')
    }
    setIsDeleting(false)
  }

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    if (!e || !e.target || !e.target.value || !e.target.validity.valid) {
      return
    }
    setLoading(true)
    await onSave(e.target.value)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), [])

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mt-6 border-l-2 border-gray-500 pl-4">
      <div className="grid grid-cols-2 gap-6">
        <div className="col-span-1 flex items-center justify-between">
          <h4>{format(new Date(note.date), 'PPp')}</h4>
          <TertiaryButton
            variant="danger"
            onClick={() => onDeleteNote()}
            loading={isDeleting}
          >
            <TrashIcon className="h-6" />
          </TertiaryButton>
        </div>
        <div className="col-start-1">
          <div className={clsx('relative mt-1 rounded-md shadow-sm')}>
            <TextareaAutosize
              name={note.publicId}
              id={note.publicId}
              className={clsx(
                'block w-full rounded-md border-gray-300 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500'
              )}
              placeholder="Take notes for this room"
              defaultValue={note.body}
              onChange={debouncedChangeHandler}
              maxRows={10}
              minRows={3}
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span
                className={clsx(
                  'flex flex-row-reverse text-gray-500 sm:text-sm'
                )}
              >
                {loading && <Spinner bg="text-blue-500" fill="fill-white" />}
              </span>
            </div>
          </div>
          <div className="mt-2 text-xs">
            {note.updatedAt && (
              <>
                <p>
                  Last updated at{' '}
                  {formatDistance(new Date(note.updatedAt), Date.now(), {
                    addSuffix: true,
                  })}
                  {note.notesAuditTrail?.length > 0 &&
                    note.notesAuditTrail[0].userName && (
                      <>
                        {' '}
                        by <strong>{note.notesAuditTrail[0].userName}</strong>
                      </>
                    )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Note
