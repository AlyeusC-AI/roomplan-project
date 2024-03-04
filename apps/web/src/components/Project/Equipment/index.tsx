import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'

import { useRouter } from 'next/router'

import TabTitleArea from '../TabTitleArea'

import AvailableEquipment from './AvailableEquipment'
import UsedEquipment from './UsedEquipment'

const ProjectEquipment = ({
  initialUsedEquipment,
  intialOrganizationEquipment,
}: {
  initialUsedEquipment: RouterOutputs['equipment']['getAllUsed']
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
}) => {
  const router = useRouter()
  const usedEquipment = trpc.equipment.getAllUsed.useQuery(
    {
      projectPublicId: router.query.id as string,
    },
    {
      initialData: initialUsedEquipment,
    }
  )

  const onAdd = async () => {
    await usedEquipment.refetch()
  }

  return (
    <div>
      <TabTitleArea
        title="Equipment Transfer"
        description="Keep track of equipment used on the job"
      ></TabTitleArea>
      <div className="mt-12 space-y-12">
        <UsedEquipment usedEquipment={usedEquipment.data} />
        <AvailableEquipment
          usedEquipment={usedEquipment.data}
          onAdd={onAdd}
          intialOrganizationEquipment={intialOrganizationEquipment}
        />
      </div>
    </div>
  )
}

export default ProjectEquipment
