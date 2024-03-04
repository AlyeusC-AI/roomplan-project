import { useState } from 'react'
import { CostType } from '@restorationx/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { laborCostsState } from '@atoms/costsState'

import CostTable from './CostTable'

export default function LaborTable() {
  const [costs, setCosts] = useRecoilState(laborCostsState)

  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const createCost = async () => {
    setIsCreating(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: 'POST',
        body: JSON.stringify({
          type: CostType.labor,
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
      estimateName="Estimated Amount"
      actualName="Contracted Amount"
      createCost={createCost}
      costs={costs}
      setCosts={setCosts}
      name="Labor"
      buttonText="Add Labor Cost"
      isCreating={isCreating}
      costType={CostType.labor}
    />
  )
}
