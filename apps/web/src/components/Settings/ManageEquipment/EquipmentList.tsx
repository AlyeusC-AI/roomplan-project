import EmptyState from '@components/DesignSystem/EmptyState'
import Table from '@components/DesignSystem/Table/Table'
import TableBody from '@components/DesignSystem/Table/TableBody'
import TableHead from '@components/DesignSystem/Table/TableHead'
import TableHeader from '@components/DesignSystem/Table/TableHeader'
import { RouterOutputs } from '@servicegeek/api'

import EquipmentItem from './EquipmentItem'

export default function EquipmentList({
  allEquipment,
}: {
  allEquipment: RouterOutputs['equipment']['getAll']
}) {
  if (allEquipment.length === 0) {
    return (
      <EmptyState
        imagePath={'/images/empty.svg'}
        title={'Get started by adding equipment'}
        description={'Add equipment to your company to start tracking it.'}
      />
    )
  }
  return (
    <Table
      header="Equipment List"
      subtitle="A list of all the equipment your company owns."
    >
      <TableHead>
        <TableHeader leading title="Name" />
        <TableHeader title="Remove" srOnly />
      </TableHead>
      <TableBody>
        {allEquipment.map((e) => (
          <EquipmentItem key={e.publicId} equipment={e} />
        ))}
      </TableBody>
    </Table>
  )
}
