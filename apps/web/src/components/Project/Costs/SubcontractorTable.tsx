"use client";

import { useState } from "react";
import { CostType } from "@servicegeek/db";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";

import CostTable from "./CostTable";

export default function SubcontractorTable() {
  const costs = costsStore((state) => state.subcontractorCosts);

  const [isCreating, setIsCreating] = useState(false);
  const { id } = useParams<{ id: string }>();
  const createCost = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/project/${id}/costs`, {
        method: "POST",
        body: JSON.stringify({
          type: CostType.subcontractor,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        costsStore.getState().addCost(
          {
            id: json.cost.id,
            name: "",
            estimatedCost: 0,
            actualCost: 0,
          },
          "subcontractor"
        );
      }
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
  };
  return (
    <CostTable
      estimateName='Estimate Amount'
      actualName='Contracted Amount'
      createCost={createCost}
      costs={costs}
      updateCost={costsStore.getState().updateSubcontractorCost}
      removeCost={costsStore.getState().removeSubcontractorCost}
      name='Subcontractor Name'
      buttonText='Add Subcontractor Cost'
      isCreating={isCreating}
      costType={CostType.subcontractor}
    />
  );
}
