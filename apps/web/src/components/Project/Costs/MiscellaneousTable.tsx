"use client";

import CostTable from "./CostTable";
import { CostType } from "@service-geek/api-client";

export default function MiscellaneousTable() {
  return (
    <CostTable
      estimateName='Estimated Cost'
      actualName='Actual Cost'
      name='Item'
      buttonText='Add Miscellaneous Cost'
      costType={CostType.MISCELLANEOUS}
    />
  );
}
