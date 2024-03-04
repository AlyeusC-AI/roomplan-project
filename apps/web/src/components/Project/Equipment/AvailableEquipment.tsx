import { useState } from 'react'
import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import Table from '@components/DesignSystem/Table/Table'
import TableBody from '@components/DesignSystem/Table/TableBody'
import TableData from '@components/DesignSystem/Table/TableData'
import TableHead from '@components/DesignSystem/Table/TableHead'
import TableHeader from '@components/DesignSystem/Table/TableHeader'
import TableRow from '@components/DesignSystem/Table/TableRow'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { v4 } from 'uuid'

const AvailableEquipmentRow = ({
  onAdd,
  equipment,
  isUsed,
}: {
  onAdd: () => Promise<void>
  equipment: RouterOutputs['equipment']['getAll'][0]
  isUsed: boolean
}) => {
  const router = useRouter()
  const utils = trpc.useContext()
  const addUsedEquipment = trpc.equipment.setQuantityUsed.useMutation({
    async onMutate({ equipmentPublicId, projectPublicId }) {
      await utils.equipment.getAllUsed.cancel()
      const prevData = utils.equipment.getAllUsed.getData()
      const availableData = utils.equipment.getAll.getData()

      const temporaryId = v4()

      utils.equipment.getAllUsed.setData({ projectPublicId }, (old) => {
        const existingEquipment = availableData?.find(
          (e) => e.publicId === equipmentPublicId
        )
        if (!existingEquipment) return old
        const newData = {
          publicId: `temporary-id-${temporaryId}`,
          quantity: 1,
          equipment: existingEquipment,
        }
        if (!old) {
          return [newData]
        }
        return [...old, newData]
      })
      return { prevData, temporaryId }
    },
    onError(err, { projectPublicId }, ctx) {
      if (ctx?.prevData)
        utils.equipment.getAllUsed.setData({ projectPublicId }, ctx.prevData)
    },
    onSettled(result) {
      utils.equipment.getAllUsed.invalidate()
    },
  })
  const [isAdding, setIsAdding] = useState(false)

  const addEquipment = async () => {
    setIsAdding(true)
    try {
      await addUsedEquipment.mutateAsync({
        projectPublicId: router.query.id as string,
        equipmentPublicId: equipment.publicId,
        quantity: 1,
      })
    } catch (e) {
      console.error(e)
    }
    setIsAdding(false)
  }

  return (
    <TableRow
      key={equipment.publicId}
      className={clsx(isUsed && 'bg-neutral-100')}
    >
      <TableData important>{equipment.name}</TableData>
      <TableData noClass>
        {isUsed ? (
          <></>
        ) : (
          <SecondaryButton loading={isAdding} onClick={addEquipment}>
            Add
          </SecondaryButton>
        )}
      </TableData>
    </TableRow>
  )
}

const AvailableEquipment = ({
  onAdd,
  usedEquipment,
  intialOrganizationEquipment,
}: {
  onAdd: () => Promise<void>
  usedEquipment?: RouterOutputs['equipment']['getAllUsed']
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
}) => {
  const availableEquipment = trpc.equipment.getAll.useQuery(undefined, {
    initialData: intialOrganizationEquipment,
  })

  return (
    <Table
      header="Available Equipment"
      subtitle={
        <p>
          A list of all the available equipment. Select equipment that was used
          on the job.
          <br /> if you don&apos;t see the equipment you need,{' '}
          <Link
            href="/settings/equipment"
            className=" text-primary hover:underline"
          >
            Add Equipment
          </Link>
          .
        </p>
      }
    >
      <TableHead>
        <TableHeader title="Name" leading />
      </TableHead>
      <TableBody>
        {availableEquipment.data?.map((equipment) => (
          <AvailableEquipmentRow
            key={equipment.publicId}
            equipment={equipment}
            onAdd={onAdd}
            isUsed={
              !!usedEquipment?.find(
                (e) => e.equipment.publicId === equipment.publicId
              )
            }
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default AvailableEquipment
