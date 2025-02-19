import { Card } from "@components/ui/card";
import CostsRow from "./CostRow";
import CostSummaryRow from "./CostSummaryRow";
import { Button } from "@components/ui/button";
import { LoadingSpinner } from "@components/ui/spinner";
import { toast } from "sonner";
import { costsStore } from "@atoms/costs";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CostTable({
  name,
  buttonText,
  costType,
  estimateName,
  actualName,
}: {
  name: string;
  buttonText: string;
  costType: CostType;
  estimateName: string;
  actualName: string;
}) {
  const costs = costsStore();
  const [isCreating, setIsCreating] = useState(false);
  const { id: projectId } = useParams<{ id: string }>();
  const createCost = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/v1/projects/${projectId}/costs`, {
        method: "POST",
        body: JSON.stringify({
          type: costType,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        toast.success("Cost added successfully");
        costs.addCost(json.cost, costType);
      } else {
        toast.error("Failed to add cost");
      }
    } catch (error) {
      toast.error("Failed to add cost");
      console.error(error);
    }
    setIsCreating(false);
  };

  return (
    <div className='mt-8 rounded-b-lg shadow-lg'>
      <Card>
        <div className='grid grid-cols-4 space-x-2 rounded-t-lg bg-muted text-foreground'>
          <h1 className='px-4 py-2 font-semibold'>{name}</h1>
          <h1 className='px-4 py-2 font-semibold'>{estimateName}</h1>
          <h1 className='px-4 py-2 font-semibold'>{actualName}</h1>
          <h1 className='px-4 py-2 font-semibold'>Difference</h1>
        </div>
        <div className='divide-y divide-gray-200'>
          {costs[`${costType}Costs`].map((cost) => (
            <CostsRow
              key={cost.id}
              costData={cost}
              namePlaceholder={name}
              costType={costType}
            />
          ))}
        </div>
        {costs[`${costType}Costs`].length > 0 && (
          <CostSummaryRow costs={costs[`${costType}Costs`]} />
        )}
        <div className='flex w-full items-center justify-center rounded-b-lg py-4'>
          <Button onClick={createCost} disabled={isCreating}>
            {isCreating ? <LoadingSpinner /> : buttonText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
