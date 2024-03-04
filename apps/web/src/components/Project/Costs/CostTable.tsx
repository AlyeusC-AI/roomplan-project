import SecondaryButton from '@components/DesignSystem/Buttons/SecondaryButton'
import { CostType } from '@restorationx/db'
import { SetterOrUpdater } from 'recoil'
import { CostDataType } from '@atoms/costsState'

import CostHeader from './CostHeader'
import CostsRow from './CostRow'
import CostSummaryRow from './CostSummaryRow'

export default function CostTable({
  costs,
  setCosts,
  name,
  buttonText,
  createCost,
  isCreating,
  costType,
  estimateName,
  actualName,
}: {
  costs: CostDataType[]
  setCosts: SetterOrUpdater<CostDataType[]>
  name: string
  buttonText: string
  createCost: () => void
  isCreating: boolean
  costType: CostType
  estimateName: string
  actualName: string
}) {
  return (
    <div className="mt-8 rounded-b-lg shadow-lg">
      <CostHeader
        name={name}
        estimateName={estimateName}
        actualName={actualName}
      />
      <div className="divide-y divide-gray-200">
        {costs.map((cost) => (
          <CostsRow
            costType={costType}
            key={cost.id}
            costData={cost}
            namePlaceholder={name}
            setCosts={setCosts}
          />
        ))}
      </div>
      {costs.length > 0 && <CostSummaryRow costs={costs} />}
      <div className="flex w-full items-center justify-center rounded-b-lg bg-white py-4">
        <SecondaryButton
          onClick={createCost}
          loading={isCreating}
          disabled={isCreating}
        >
          {buttonText}
        </SecondaryButton>
      </div>
    </div>
  )
}
