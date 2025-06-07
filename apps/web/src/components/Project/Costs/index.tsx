import { Separator } from "@components/ui/separator";
import CostsTable from "./CostsTable";

export default function Costs({}: {}) {
  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-lg font-medium'>Expenses</h2>
        <p className='text-sm text-muted-foreground'>
          Track estimates and actual costs of a project
        </p>
      </div>
      <Separator />
      <CostsTable />
    </div>
  );
}
