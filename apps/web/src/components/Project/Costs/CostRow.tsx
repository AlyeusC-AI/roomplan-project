import { useEffect, useState } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Trash } from "lucide-react";
import { LoadingSpinner } from "@components/ui/spinner";
import { useDebounce } from "@hooks/use-debounce";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { costsStore } from "@atoms/costs";
import {
  CostType,
  Cost,
  useUpdateCost,
  useDeleteCost,
} from "@service-geek/api-client";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CostsRow = ({
  costData,
  namePlaceholder,
  costType,
}: {
  costData: Cost;
  namePlaceholder: string;
  costType: CostType;
}) => {
  const [newName, setNewName] = useState(costData.name ?? "");
  const [newEstimatedCost, setNewEstimatedCost] = useState(
    costData.estimatedCost
  );
  const { id: projectId } = useParams<{ id: string }>();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newActualCost, setNewActualCost] = useState(costData.actualCost);
  const { mutate: updateCostMutation } = useUpdateCost();
  const { mutate: deleteCostMutation } = useDeleteCost();

  const updateCost = async (id: string, cost: Partial<Cost>) => {
    try {
      setIsUpdating(true);
      const res = await updateCostMutation({
        id,
        data: {
          name: debouncedName,
          estimatedCost: debouncedEstimatedCost,
          actualCost: debouncedActualCost,
        },
      });
    } catch (error) {
      toast.error("Failed to update cost");
      console.error(error);
    }

    setIsUpdating(false);
  };

  const deleteCost = async (id: string) => {
    try {
      setIsDeleting(true);
      console.log("id", id);
      const res = await deleteCostMutation(id);

      toast.success("Cost removed successfully");
    } catch (error) {
      toast.error("Failed to removed cost");
      console.error(error);
    }

    setIsDeleting(false);
  };

  const debouncedName = useDebounce(newName, 1000);
  const debouncedEstimatedCost = useDebounce(newEstimatedCost, 1000);
  const debouncedActualCost = useDebounce(newActualCost, 1000);

  useEffect(() => {
    if (
      debouncedName === costData.name &&
      debouncedEstimatedCost === costData.estimatedCost &&
      debouncedActualCost === costData.actualCost
    ) {
      return;
    }
    updateCost(costData!.id, {
      name: debouncedName,
      estimatedCost: debouncedEstimatedCost,
      actualCost: debouncedActualCost,
    });
  }, [debouncedName, debouncedEstimatedCost, debouncedActualCost]);

  return (
    <div className='my-3 grid grid-cols-4 space-x-2'>
      <Input
        disabled={isUpdating}
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={newName ?? ""}
        onChange={(e) => setNewName(e.target.value)}
        placeholder={namePlaceholder}
        name={namePlaceholder}
      />
      <Input
        disabled={isUpdating}
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={newEstimatedCost ?? ""}
        onChange={(e) => setNewEstimatedCost(parseFloat(e.target.value))}
        placeholder='Estimated Amount'
        type='number'
        name='Estimated Amount'
      />
      <Input
        disabled={isUpdating}
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={newActualCost ?? ""}
        onChange={(e) => setNewActualCost(parseFloat(e.target.value))}
        placeholder='Actual Amount'
        type='number'
        name='Actual Amount'
      />
      <div className='mx-3 flex'>
        <div className='flex w-5/6 items-center justify-start border-none px-4 py-2'>
          {formatter.format(
            (costData.estimatedCost ?? 0) - (costData.actualCost || 0)
          )}
        </div>
        <Button
          className='mx-3'
          variant='destructive'
          disabled={isDeleting}
          onClick={() => deleteCost(costData.id)}
        >
          {isDeleting ? <LoadingSpinner /> : <Trash size={24} />}
        </Button>
      </div>
    </div>
  );
};

export default CostsRow;
