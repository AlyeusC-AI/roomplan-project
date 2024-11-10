import { useState } from 'react'
import { CostType } from '@servicegeek/db'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import { miscellaneousCostsState } from '@atoms/costsState'

import CostTable from './CostTable'

export default function MiscellaneousTable() {
  const [costs, setCosts] = useRecoilState(miscellaneousCostsState)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const createCost = async () => {
    setIsCreating(true)
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: 'POST',
        body: JSON.stringify({
          type: CostType.miscellaneous,
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
      estimateName="Estimated Cost"
      actualName="Actual Cost"
      createCost={createCost}
      costs={costs}
      setCosts={setCosts}
      name="Item"
      buttonText="Add Miscellaneous Cost"
      isCreating={isCreating}
      costType={CostType.miscellaneous}
    />
  )
}
