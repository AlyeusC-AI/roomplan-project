import MaterialsTable from "@/components/Materials/MaterialsTable";

export default function MaterialsPage() {
  return (
    <div className='container mx-auto py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold'>Materials Management</h1>
        <p className='mt-2 text-muted-foreground'>
          Manage materials and check dry standard compliance. Materials with
          variance ≤ 15% meet dry standard requirements.
        </p>
      </div>
      <MaterialsTable />
    </div>
  );
}
