"use client";

import { useState } from "react";
import { CostType } from "@servicegeek/db";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";

import CostTable from "./CostTable";
import { projectStore } from "@atoms/project";

export default function MaterialsTable() {
  const costs = costsStore((state) => state.materialsCosts);
  const [isCreating, setIsCreating] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { project } = projectStore((state) => state);

  const createCost = async () => {
    setIsCreating(true);
    try {
      const res = await fetch(`/api/project/${id}/costs`, {
        method: "POST",
        body: JSON.stringify({
          type: CostType.materials,
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
            createdAt: new Date().toISOString(),
            type: "materials",
            isDeleted: false,
            projectId: project?.id ?? 0,
            updatedAt: new Date().toISOString(),
          },
          "materials"
        );
      }
    } catch (error) {
      console.error(error);
    }
    setIsCreating(false);
  };

  return (
    <CostTable
      estimateName='Estimate Summary'
      actualName='Actual Cost'
      createCost={createCost}
      costs={costs}
      updateCost={(id, costs) =>
        costsStore.getState().updateCost(id, costs, "materials")
      }
      removeCost={(id: number) =>
        costsStore.getState().removeCost(id, "materials")
      }
      name='Material'
      buttonText='Add Material Cost'
      isCreating={isCreating}
      costType={CostType.materials}
    />
  );
}
