import { useState } from 'react'
import toast from 'react-hot-toast'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import Card from '@components/DesignSystem/Card'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@servicegeek/api'
import { v4 } from 'uuid'
import { colorHash } from '@utils/color-hash'
import WorkflowStatus from './WorkflowStatus'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { getRndInteger } from '@servicegeek/utils'
import { InformationCircleIcon } from '@heroicons/react/24/outline'

export default function ManageWorkflow({
  statuses,
}: {
  statuses: RouterOutputs['projectStatus']['getAllProjectStatuses']['statuses']
}) {
  const [newLabel, setNewLabel] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const utils = trpc.useContext()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const reorderStatuses = trpc.projectStatus.reorderProjectStatuses.useMutation(
    {
      async onMutate({ oldIndex, newIndex }) {
        await utils.projectStatus.getAllProjectStatuses.cancel()
        const prevData = utils.projectStatus.getAllProjectStatuses.getData()

        utils.projectStatus.getAllProjectStatuses.setData({}, (old) => {
          if (!old || !old.statuses) {
            return { statuses: [] }
          }
          const oldStatuses = [...old?.statuses]
          const newArr = arrayMove(oldStatuses, oldIndex, newIndex)

          return { statuses: newArr }
        })
        return { prevData }
      },
      onError(err, data, ctx) {
        if (ctx?.prevData)
          utils.projectStatus.getAllProjectStatuses.setData({}, ctx.prevData)
      },
      onSettled(result) {
        utils.projectStatus.getAllProjectStatuses.invalidate()
      },
    }
  )

  const createLabel = trpc.projectStatus.createProjectStatus.useMutation({
    async onMutate({ label, description, color }) {
      await utils.projectStatus.getAllProjectStatuses.cancel()
      const prevData = utils.projectStatus.getAllProjectStatuses.getData()
      const temporaryId = v4()

      utils.projectStatus.getAllProjectStatuses.setData({}, (old) => {
        const newData = {
          label,
          description,
          color,
          publicId: `temporary-${temporaryId}`,
          order: old?.statuses.length || -1,
          id: getRndInteger(9000, 1000),
        }
        if (!old || !old.statuses) {
          return { statuses: [newData] }
        }
        return { statuses: [newData, ...old.statuses] }
      })
      return { prevData, temporaryId }
    },
    onError(err, data, ctx) {
      if (ctx?.prevData)
        utils.projectStatus.getAllProjectStatuses.setData({}, ctx.prevData)
    },
    onSettled(result) {
      utils.projectStatus.getAllProjectStatuses.invalidate()
    },
  })

  const allStatuses = trpc.projectStatus.getAllProjectStatuses.useQuery(
    {},
    {
      initialData: { statuses },
    }
  )

  const addLabel = async () => {
    setIsAdding(true)
    try {
      await createLabel.mutateAsync({
        label: newLabel,
        description: '',
        color: colorHash(newLabel).rgb,
      })
      toast.success(`Added equipment: ${newLabel}`)
    } catch (e) {
      console.error(e)
    }
    setNewLabel('')
    setIsAdding(false)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    const copiedStatuses = [...allStatuses.data.statuses]
    const oldIndex = copiedStatuses.findIndex((o) => o.id === active.id)
    const newIndex = copiedStatuses.findIndex((o) => o.id === over?.id)

    const newArr = arrayMove(copiedStatuses, oldIndex, newIndex)
    const ordering = newArr.map((d) => ({ publicId: d.publicId }))
    reorderStatuses.mutate({ ordering, oldIndex, newIndex })
  }

  const allLabels = allStatuses.data?.statuses || []
  return (
    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <Card bg="" className="shadow-none">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Manage Project Statuses
        </h2>
        <div className="my-8 w-full">
          <label
            htmlFor="equipment"
            className="block text-sm font-medium text-gray-700"
          >
            Add Label
          </label>
          <div className="mt-1 flex justify-between gap-2">
            <input
              type="equipment"
              name="equipment"
              id="equipment"
              className="block w-full rounded-md border border-gray-200 px-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="New label"
              onChange={(e) => setNewLabel(e.target.value)}
              value={newLabel}
              disabled={isAdding}
            />
            <div className="flex w-80 justify-end">
              <PrimaryButton
                className="w-full"
                onClick={addLabel}
                disabled={isAdding || !newLabel}
              >
                Add New Label
              </PrimaryButton>
            </div>
          </div>
        </div>
        <div className="mb-6 flex">
          <InformationCircleIcon className="mr-4 h-6 text-gray-800" /> Drag
          statuses to change their order. The order here is the order that will
          be displayed on your Projects page while using the "board" view.
        </div>
        <div className="flex flex-col gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={allLabels}
              strategy={verticalListSortingStrategy}
            >
              {allLabels.map((s) => (
                <WorkflowStatus key={s.label} label={s} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </Card>
    </div>
  )
}
