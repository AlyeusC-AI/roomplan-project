import { useState } from 'react'
import { CostType } from '@servicegeek/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { materialsCostsState } from '@atoms/costsState'

import CostTable from './CostTable'

export default function MaterialsTable() {
  const [costs, setCosts] = useRecoilState(materialsCostsState)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createCost = async () => {
    setIsCreating(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: 'POST',
        body: JSON.stringify({
          type: CostType.materials,
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setCosts((prevCosts) => [
          ...prevCosts,
          { id: json.cost.id, name: '', estimatedCost: 0, actualCost: 0 },
        ])
      }
    } catch (error) {
      console.error(error)
    }
    setIsCreating(false)
  }

  return (
    <CostTable
      estimateName="Estimate Summary"
      actualName="Actual Cost"
      createCost={createCost}
      costs={costs}
      setCosts={setCosts}
      name="Material"
      buttonText="Add Material Cost"
      isCreating={isCreating}
      costType={CostType.materials}
    />
  )
}
