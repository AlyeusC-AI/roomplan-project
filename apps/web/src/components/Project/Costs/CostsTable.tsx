import LaborTable from "./LaborTable";
import MaterialsTable from "./MaterialsTable";
import MiscellaneousTable from "./MiscellaneousTable";
import SubcontractorTable from "./SubcontractorTable";
import TotalsTable from "./TotalsTable";

export default function CostsTable({
  rcvValue,
  actualValue,
}: {
  rcvValue: number;
  actualValue: number;
}) {
  return (
    <div className='space-y-6'>
      <div className='mt-6'>
        <TotalsTable rcvValue={rcvValue} actualValue={actualValue} />
      </div>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Subcontractor Costs
        </h1>
        <p className='mt-2 text-lg text-gray-500'>
          Amount of money paid to subcontractors for the work needed at the job
        </p>
        <SubcontractorTable />
      </div>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Materials Costs
        </h1>
        <p className='mt-2 text-lg text-gray-500'>
          Amount of money spent to purchase materials to complete the job
        </p>
        <MaterialsTable />
      </div>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900'>Labor Costs</h1>
        <p className='mt-2 text-lg text-gray-500'>
          Track labor costs and wages
        </p>
        <LaborTable />
      </div>
      <div>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Miscellaneous Costs
        </h1>
        <p className='mt-2 text-lg text-gray-500'>
          Unexpected and incurred costs at the job
        </p>
        <MiscellaneousTable />
      </div>
    </div>
  );
}
