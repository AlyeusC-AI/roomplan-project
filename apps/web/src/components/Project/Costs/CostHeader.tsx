const CostHeader = ({
  name,
  estimateName,
  actualName,
}: {
  name: string;
  estimateName: string;
  actualName: string;
}) => {
  return (
    <div className='grid grid-cols-4 space-x-2 rounded-t-lg bg-gray-200'>
      <h1 className='px-4 py-2 font-semibold text-gray-900'>{name}</h1>
      <h1 className='px-4 py-2 font-semibold text-gray-900'>{estimateName}</h1>
      <h1 className='px-4 py-2 font-semibold text-gray-900'>{actualName}</h1>
      <h1 className='px-4 py-2 font-semibold text-gray-900'>Difference</h1>
    </div>
  );
};

export default CostHeader;
