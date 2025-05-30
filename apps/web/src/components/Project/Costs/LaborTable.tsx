"use client";

import CostTable from "./CostTable";
import { CostType } from "@service-geek/api-client";

export default function LaborTable() {
  return (
    <CostTable
      estimateName='Estimated Amount'
      actualName='Contracted Amount'
      name='Labor'
      buttonText='Add Labor Cost'
      costType={CostType.LABOR}
    />
  );
}
