"use client";

import CostTable from "./CostTable";
import { CostType } from "@service-geek/api-client";

export default function MaterialsTable() {
  return (
    <CostTable
      estimateName='Estimate Summary'
      actualName='Actual Cost'
      name='Material'
      buttonText='Add Material Cost'
      costType={CostType.MATERIAL}
    />
  );
}
