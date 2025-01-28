import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Trash } from "lucide-react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CostsRow = ({
  costData,
  namePlaceholder,
  updateCost,
  removeCost,
  costType,
}: {
  costData?: CostData;
  namePlaceholder: string;
  updateCost: (id: string, cost: Omit<CostData, "id">) => void;
  removeCost: (id: string) => void;
  costType: CostDataType;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const onDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: "DELETE",
        body: JSON.stringify({
          type: costType,
          costId: costData?.id,
        }),
      });
      if (res.ok) {
        removeCost(costData!.id);
        // setCosts((prevCosts) =>
        //   produce(prevCosts, (draft) => {
        //     const index = prevCosts.findIndex((c) => c.id === costData?.id)
        //     if (index >= 0) {
        //       draft.splice(index, 1)
        //     }
        //   })
        // )
      }
    } catch (error) {
      console.error(error);
    }
    setIsDeleting(false);
  };

  const onSave = async (data: {
    name?: string;
    estimatedCost?: number;
    actualCost?: number;
  }) => {
    try {
      const res = await fetch(`/api/project/${router.query.id}/costs`, {
        method: "PATCH",
        body: JSON.stringify({
          type: costType,
          costId: costData?.id,
          costData: data,
        }),
      });
      if (res.ok) {
        // @ts-expect-error
        updateCost(costData!.id, { ...data });
        // setCosts((prevCosts) =>
        //   produce(prevCosts, (draft) => {
        //     const index = prevCosts.findIndex((c) => c.id === costData?.id)
        //     draft[index] = { ...draft[index], ...data }
        //   })
        // )
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className='grid grid-cols-4 space-x-2 bg-white'>
      <Input
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={costData?.name || ""}
        // onSave={(name) => onSave({ name })}
        placeholder={namePlaceholder}
        // ignoreInvalid
        name={namePlaceholder}
      />
      <Input
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={costData?.estimatedCost || ""}
        onSave={(estimatedCost) =>
          onSave({ estimatedCost: parseInt(estimatedCost) })
        }
        placeholder='Estimated Amount'
        ignoreInvalid
        type='number'
        name='Estimated Amount'
        units='$'
      />
      <Input
        className='border-none px-4 py-2 focus:border-none focus:outline-none'
        defaultValue={costData?.actualCost || ""}
        onSave={(actualCost) => onSave({ actualCost: parseInt(actualCost) })}
        placeholder='Actual Amount'
        ignoreInvalid
        type='number'
        name='Actual Amount'
        units='$'
      />
      <div className='flex'>
        <div className='flex w-5/6 items-center justify-start border-none bg-gray-100 px-4 py-2'>
          {formatter.format(
            (costData?.estimatedCost || 0) - (costData?.actualCost || 0)
          )}
        </div>
        <Button
          variant='destructive'
          loading={isDeleting}
          disabled={isDeleting}
          onClick={onDelete}
        >
          <Trash className='h-5' />
        </Button>
      </div>
    </div>
  );
};

export default CostsRow;
