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

export default function CostsTable({
  rcvValue,
}: {
  rcvValue: number;
  actualValue: number;
}) {
  const [fetching, setFetching] = useState(true);
  const { id } = useParams<{ id: string }>();
  const costs = costsStore();
  useEffect(() => {
    setFetching(true);
    fetch(`/api/v1/projects/${id}/costs`)
      .then((res) => res.json())
      .then((json) => {
        costs.setCosts(json.costs);
        console.log(json);
        setFetching(false);
      });
  }, []);

  if (fetching) {
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
