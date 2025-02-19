"use client";

import CostTable from "./CostTable";

export default function LaborTable() {
  return (
    <CostTable
      estimateName='Estimated Amount'
      actualName='Contracted Amount'
      name='Labor'
      buttonText='Add Labor Cost'
      costType='labor'
    />
  );
}
