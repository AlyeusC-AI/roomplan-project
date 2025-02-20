"use client";

import CostTable from "./CostTable";

export default function SubcontractorTable({
  fetchCosts,
}: {
  fetchCosts: () => void;
}) {
  return (
    <CostTable
      estimateName='Estimate Amount'
      actualName='Contracted Amount'
      name='Subcontractor Name'
      buttonText='Add Subcontractor Cost'
      costType='subcontractor'
      fetchCosts={fetchCosts}
    />
  );
}
