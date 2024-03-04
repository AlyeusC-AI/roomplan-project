import { useState } from 'react'
import toast from 'react-hot-toast'
import PrimaryButton from '@components/DesignSystem/Buttons/PrimaryButton'
import Card from '@components/DesignSystem/Card'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'
import { v4 } from 'uuid'

import EquipmentList from './EquipmentList'

export default function ManageEquipment({
  intialOrganizationEquipment,
}: {
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
}) {
  const [newEquipmentEntry, setNewEquipmentEntry] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const utils = trpc.useContext()

  const createEquipment = trpc.equipment.create.useMutation({
    async onMutate({ name }) {
      await utils.equipment.getAll.cancel()
      const prevData = utils.equipment.getAll.getData()
      const temporaryId = v4()

      utils.equipment.getAll.setData(undefined, (old) => {
        const newData = {
          name,
          publicId: `temporary-${temporaryId}`,
          quantity: 1,
        }
        if (!old) {
          return [newData]
        }
        return [newData, ...old]
      })
      return { prevData, temporaryId }
    },
    onError(err, data, ctx) {
      if (ctx?.prevData) utils.equipment.getAll.setData(undefined, ctx.prevData)
    },
    onSettled(result) {
      utils.equipment.getAll.invalidate()
    },
  })
  const allEquipment = trpc.equipment.getAll.useQuery(undefined, {
    initialData: intialOrganizationEquipment,
  })

  const addEquipment = async () => {
    setIsAdding(true)
    try {
      await createEquipment.mutateAsync({ name: newEquipmentEntry })
      toast.success(`Added equipment: ${newEquipmentEntry}`)
    } catch (e) {
      console.error(e)
    }
    setNewEquipmentEntry('')
    setIsAdding(false)
  }
  return (
    <div className="space-y-6 sm:px-6 lg:col-span-9 lg:px-0">
      <Card bg="" className="shadow-none">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Manage Equipment
        </h2>
        <div className="my-8 w-full">
          <label
            htmlFor="equipment"
            className="block text-sm font-medium text-gray-700"
          >
            Add Equipment
          </label>
          <div className="mt-1 flex justify-between gap-2">
            <input
              type="equipment"
              name="equipment"
              id="equipment"
              className="block w-full rounded-md border-gray-300 px-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Dehumidifier #001"
              onChange={(e) => setNewEquipmentEntry(e.target.value)}
              value={newEquipmentEntry}
              disabled={isAdding}
            />
            <div className="flex w-80 justify-end">
              <PrimaryButton
                className="w-full"
                onClick={addEquipment}
                disabled={isAdding || !newEquipmentEntry}
              >
                Add New Equipment
              </PrimaryButton>
            </div>
          </div>
        </div>
        <EquipmentList allEquipment={allEquipment.data || []} />
      </Card>
    </div>
  )
}
