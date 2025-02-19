import { Separator } from "@components/ui/separator";

const Table = ({
  header,
  subtitle,
  children,
}: {
  header: string;
  subtitle: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <>
      <div className='sm:flex sm:items-center'>
        <div className='w-full space-y-6'>
          <div>
            <h3 className='text-lg font-medium'>{header}</h3>
            <p className='text-sm text-muted-foreground'>{subtitle}</p>
          </div>
          <Separator />
        </div>
      </div>
      <div className='mt-8 flex h-full flex-col'>
        <div className='-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black/5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                {children}
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Table;
