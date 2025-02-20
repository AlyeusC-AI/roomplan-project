"use client";

import CostTable from "./CostTable";

export default function MiscellaneousTable({
  fetchCosts,
}: {
  fetchCosts: () => void;
}) {
  return (
    <CostTable
      estimateName='Estimated Cost'
      actualName='Actual Cost'
      name='Item'
      buttonText='Add Miscellaneous Cost'
      costType='miscellaneous'
      fetchCosts={fetchCosts}
    />
  );
}
