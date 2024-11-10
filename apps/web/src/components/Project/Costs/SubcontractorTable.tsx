import { useState } from 'react'
import { CostType } from '@servicegeek/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { subcontractorCostsState } from '@atoms/costsState'

import CostTable from './CostTable'

export default function SubcontractorTable() {
  const [costs, setCosts] = useRecoilState(subcontractorCostsState)

  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()
  const createCost = async () => {
    setIsCreating(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: 'POST',
        body: JSON.stringify({
          type: CostType.subcontractor,
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
      estimateName="Estimate Amount"
      actualName="Contracted Amount"
      createCost={createCost}
      costs={costs}
      setCosts={setCosts}
      name="Subcontractor Name"
      buttonText="Add Subcontractor Cost"
      isCreating={isCreating}
      costType={CostType.subcontractor}
    />
  )
}
