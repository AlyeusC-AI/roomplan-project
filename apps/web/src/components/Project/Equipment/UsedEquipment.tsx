import { useState } from 'react'
import TertiaryButton from '@components/DesignSystem/Buttons/TertiaryButton'
import Table from '@components/DesignSystem/Table/Table'
import TableBody from '@components/DesignSystem/Table/TableBody'
import TableData from '@components/DesignSystem/Table/TableData'
import TableHead from '@components/DesignSystem/Table/TableHead'
import TableHeader from '@components/DesignSystem/Table/TableHeader'
import TableRow from '@components/DesignSystem/Table/TableRow'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@servicegeek/api'
import produce from 'immer'
import { useRouter } from 'next/router'

const UsedEquipmentRow = ({
  equipment,
}: {
  equipment: RouterOutputs['equipment']['getAllUsed'][0]
}) => {
  const router = useRouter()
  const utils = trpc.useContext()

  const addUsedEquipment = trpc.equipment.setQuantityUsed.useMutation({
    onSettled(d, a) {
      // Sync with server once mutation has settled
      utils.equipment.getAllUsed.invalidate()
    },
  })
  const removeUsedEquipment = trpc.equipment.removeUsedItem.useMutation({
    async onMutate({ projectPublicId, usedItemPublicId }) {
      await utils.equipment.getAllUsed.cancel()
      const prevData = utils.equipment.getAllUsed.getData()
      utils.equipment.getAllUsed.setData({ projectPublicId }, (old) =>
        produce(old, (draft) => {
          const index = old?.findIndex((p) => p.publicId === usedItemPublicId)
          if (index !== undefined && index >= 0) draft?.splice(index, 1)
        })
      )
      return { prevData }
    },
    onError(err, { projectPublicId }, ctx) {
      // If the mutation fails, use the context-value from onMutate
      if (ctx?.prevData)
        utils.equipment.getAllUsed.setData({ projectPublicId }, ctx.prevData)
    },
    onSettled(d, a) {
      utils.equipment.getAllUsed.invalidate()
    },
  })
  const [isRemoving, setIsRemoving] = useState(false)

  const onRemove = async () => {
    setIsRemoving(true)
    if (equipment.publicId.indexOf('temporary') === -1) {
      try {
        await removeUsedEquipment.mutateAsync({
          projectPublicId: router.query.id as string,
          usedItemPublicId: equipment.publicId,
        })
      } catch (e) {
        console.error(e)
      }
    }
    setIsRemoving(false)
  }

  return (
    <TableRow key={equipment.publicId}>
      <TableData important>{equipment.equipment.name}</TableData>
      <TableData noClass>
        <TertiaryButton onClick={() => onRemove()} loading={isRemoving}>
          Remove
        </TertiaryButton>
      </TableData>
    </TableRow>
  )
}

const UsedEquipment = ({
  usedEquipment,
}: {
  usedEquipment?: RouterOutputs['equipment']['getAllUsed']
}) => {
  return (
    <Table
      header="Used Equipment"
      subtitle="A list of all the equipment used on the job."
    >
      <TableHead>
        <TableHeader title="Name" leading />
      </TableHead>
      <TableBody>
        {usedEquipment?.map((usedItem) => (
          <UsedEquipmentRow key={usedItem.publicId} equipment={usedItem} />
        ))}
      </TableBody>
    </Table>
  )
}

export default UsedEquipment
