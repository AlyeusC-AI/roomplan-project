"use client";

import CostTable from "./CostTable";

export default function SubcontractorTable() {
  return (
    <CostTable
      estimateName='Estimate Amount'
      actualName='Contracted Amount'
      name='Subcontractor Name'
      buttonText='Add Subcontractor Cost'
      costType='subcontractor'
    />
  );
}
