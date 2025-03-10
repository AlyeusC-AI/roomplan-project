"use client";

import CostTable from "./CostTable";

export default function MaterialsTable({
  fetchCosts,
}: {
  fetchCosts: () => void;
}) {
  return (
    <CostTable
      estimateName='Estimate Summary'
      actualName='Actual Cost'
      name='Material'
      buttonText='Add Material Cost'
      costType='materials'
      fetchCosts={fetchCosts}
    />
  );
}
