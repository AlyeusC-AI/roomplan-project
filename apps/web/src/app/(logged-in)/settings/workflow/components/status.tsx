import { RouterOutputs } from '@servicegeek/api'
import { useDebounce } from '@servicegeek/utils'
import { trpc } from '@utils/trpc'
import { useEffect, useState } from 'react'
import ColorPicker, { STATUS_COLORS } from './color-picker'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import clsx from 'clsx'

const WorkflowStatus = ({
  label,
}: {
  label: RouterOutputs['projectStatus']['getAllProjectStatuses']['statuses'][0]
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
  } = useSortable({ id: label.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const [newLabel, setNewLabel] = useState<string>(label.label)
  const [newColor, setNewColor] = useState<string>(label.color)
  const [newDescription, setNewDescription] = useState<string>(
    label.description
  )

  const debouncedLabel = useDebounce(newLabel, 1000)
  const debouncedDescription = useDebounce(newDescription, 1000)

  const editProjectStatusMutation =
    trpc.projectStatus.editProjectStatus.useMutation()

  useEffect(() => {
    editProjectStatusMutation.mutate({
      label: newLabel,
      description: newDescription,
      color: newColor,
      publicId: label.publicId,
    })
  }, [debouncedLabel, debouncedDescription, newColor])

  const selectedColor = STATUS_COLORS.find((s) => s.name === newColor)

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="isolate flex -space-y-px rounded-md shadow-sm">
        <div
          className={clsx(
            'flex',
            'overflow-hidden rounded-tl-md rounded-bl-md ring-1 ring-gray-300 hover:bg-gray-100 '
          )}
          ref={setActivatorNodeRef}
          {...listeners}
        >
          <button
            className={clsx(
              'bg-opacity-40 px-2 py-4',
              selectedColor?.bgColor && selectedColor.bgColor,
              `hover:bg-opacity-80`
            )}
          >
            <svg viewBox="0 0 20 20" width="12">
              <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
            </svg>
          </button>
        </div>
        <div className="flex w-full flex-col">
          <div className="relative rounded-md rounded-b-none rounded-tl-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600">
            <label
              htmlFor="name"
              className="block text-xs font-medium text-gray-900"
            >
              Label Name
            </label>
            <input
              type="text"
              value={newLabel}
              className="block w-full border-0 bg-transparent px-0 py-2 text-lg font-bold text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Label Name"
              onChange={(e) => setNewLabel(e.target.value)}
            />
          </div>
          <div className="relative rounded-none px-3 pb-1.5 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600">
            <label
              htmlFor="job-title"
              className="block text-xs font-medium text-gray-900"
            >
              Label Description
            </label>
            <input
              type="text"
              value={newDescription}
              className="block w-full border-0 bg-transparent px-0 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Label Description"
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>
          <div className="relative rounded-md rounded-t-none rounded-bl-none px-3 pb-4 pt-2.5 ring-1 ring-inset ring-gray-300 focus-within:z-10 focus-within:ring-2 focus-within:ring-blue-600">
            <ColorPicker
              labelName={newLabel}
              newColor={newColor}
              setNewColor={setNewColor}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
export default WorkflowStatus
