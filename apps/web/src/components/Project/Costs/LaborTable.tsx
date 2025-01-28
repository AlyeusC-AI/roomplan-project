"use client";

import { useState } from "react";
import { CostType } from "@servicegeek/db";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";

import CostTable from "./CostTable";

export default function LaborTable() {
  const costs = costsStore((state) => state.laborCosts);

  const [isCreating, setIsCreating] = useState(false);
  const { id } = useParams<{ id: string }>();
  const createCost = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/project/${id}/costs`, {
        method: "POST",
        body: JSON.stringify({
          type: CostType.labor,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        costsStore
          .getState()
          .addCost(
            { id: json.cost.id, name: "", estimatedCost: 0, actualCost: 0 },
            "labor"
          );
      }
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
  };
  return (
    <CostTable
      estimateName='Estimated Amount'
      actualName='Contracted Amount'
      createCost={createCost}
      costs={costs}
      updateCost={(id, costs) =>
        costsStore.getState().updateCost(id, costs, "labor")
      }
      removeCost={(id: string) => costsStore.getState().removeCost(id, "labor")}
      name='Labor'
      buttonText='Add Labor Cost'
      isCreating={isCreating}
      costType={"labor"}
    />
  );
}
