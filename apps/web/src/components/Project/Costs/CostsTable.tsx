import { Separator } from "@components/ui/separator";
import LaborTable from "./LaborTable";
import MaterialsTable from "./MaterialsTable";
import MiscellaneousTable from "./MiscellaneousTable";
import SubcontractorTable from "./SubcontractorTable";
import TotalsTable from "./TotalsTable";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";
import { LoadingPlaceholder } from "@components/ui/spinner";
import { useGetCosts, useGetProjectById } from "@service-geek/api-client";

export default function CostsTable() {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useGetProjectById(id);
  const rcvValue = Number(project?.data?.rcvValue || 0);
  const { isLoading } = useGetCosts(id);

  if (isLoading) {
    return <LoadingPlaceholder />;
  }

  return (
    <div className='space-y-6'>
      <div className='mt-6'>
        <TotalsTable rcvValue={rcvValue} />
      </div>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Subcontractor Costs</h3>
          <p className='text-sm text-muted-foreground'>
            Amount of money paid to subcontractors for the work needed at the
            job
          </p>
        </div>
        <Separator />
        <SubcontractorTable />
      </div>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Materials Costs</h3>
          <p className='text-sm text-muted-foreground'>
            Amount of money spent to purchase materials to complete the job
          </p>
        </div>
        <Separator />
        <MaterialsTable />
      </div>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Labor Costs</h3>
          <p className='text-sm text-muted-foreground'>
            Track labor costs and wages
          </p>
        </div>
        <Separator />
        <LaborTable />
      </div>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Miscellaneous Costs</h3>
          <p className='text-sm text-muted-foreground'>
            Unexpected and incurred costs at the job
          </p>
        </div>
        <Separator />
        <MiscellaneousTable />
      </div>
    </div>
  );
}
