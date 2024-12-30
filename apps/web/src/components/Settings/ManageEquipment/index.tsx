import { useState } from 'react'
import toast from 'react-hot-toast'
import { PrimaryButton } from '@components/components/button'
import Card from '@components/DesignSystem/Card'
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@servicegeek/api'
import { v4 } from 'uuid'

import EquipmentList from './EquipmentList'

export default function ManageEquipment({
  intialOrganizationEquipment,
}: {
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
}) {

  return (

  )
}
