"use client";

import CostTable from "./CostTable";

export default function LaborTable({ fetchCosts }: { fetchCosts: () => void }) {
  return (
    <CostTable
      estimateName='Estimated Amount'
      actualName='Contracted Amount'
      name='Labor'
      buttonText='Add Labor Cost'
      costType='labor'
      fetchCosts={fetchCosts}
    />
  );
}
