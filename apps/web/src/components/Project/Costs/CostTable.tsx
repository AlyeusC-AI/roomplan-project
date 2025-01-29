import { SecondaryButton } from "@components/components";

import CostHeader from "./CostHeader";
import CostsRow from "./CostRow";
import CostSummaryRow from "./CostSummaryRow";

export default function CostTable({
  costs,
  updateCost,
  removeCost,
  name,
  buttonText,
  createCost,
  isCreating,
  costType,
  estimateName,
  actualName,
}: {
  costs: Cost[];
  updateCost: (id: number, costs: Omit<Cost, "id">) => void;
  removeCost: (id: number) => void;
  name: string;
  buttonText: string;
  createCost: () => void;
  isCreating: boolean;
  costType: CostType;
  estimateName: string;
  actualName: string;
}) {
  return (
    <div className='mt-8 rounded-b-lg shadow-lg'>
      <CostHeader
        name={name}
        estimateName={estimateName}
        actualName={actualName}
      />
      <div className='divide-y divide-gray-200'>
        {costs.map((cost) => (
          <CostsRow
            costType={costType}
            key={cost.id}
            costData={cost}
            namePlaceholder={name}
            updateCost={updateCost}
            removeCost={removeCost}
          />
        ))}
      </div>
      {costs.length > 0 && <CostSummaryRow costs={costs} />}
      <div className='flex w-full items-center justify-center rounded-b-lg bg-white py-4'>
        <SecondaryButton
          onClick={createCost}
          loading={isCreating}
          disabled={isCreating}
        >
          {buttonText}
        </SecondaryButton>
      </div>
    </div>
  );
}
