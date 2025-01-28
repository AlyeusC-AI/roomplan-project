"use client";

import { useState } from "react";
import { CostType } from "@servicegeek/db";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";

import CostTable from "./CostTable";

export default function MiscellaneousTable() {
  const costs = costsStore((state) => state.miscellaneousCosts);
  const [isCreating, setIsCreating] = useState(false);
  const { id } = useParams<{ id: string }>();

  const createCost = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/project/${id}/costs`, {
        method: "POST",
        body: JSON.stringify({
          type: CostType.miscellaneous,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        costsStore
          .getState()
          .addCost(
            { id: json.cost.id, name: "", estimatedCost: 0, actualCost: 0 },
            "miscellaneous"
          );
      }
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
  };
  return (
    <CostTable
      estimateName='Estimated Cost'
      actualName='Actual Cost'
      createCost={createCost}
      costs={costs}
      removeCost={(id: string) =>
        costsStore.getState().removeCost(id, "miscellaneous")
      }
      updateCost={(id, costs) =>
        costsStore.getState().updateCost(id, costs, "miscellaneous")
      }
      name='Item'
      buttonText='Add Miscellaneous Cost'
      isCreating={isCreating}
      costType={CostType.miscellaneous}
    />
  );
}
