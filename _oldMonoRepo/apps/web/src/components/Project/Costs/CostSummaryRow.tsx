import { useMemo } from "react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const CostSummaryRow = ({ costs }: { costs: Cost[] }) => {
  const totalEstimate = useMemo(
    () => costs.reduce((p, c) => (c.estimatedCost || 0) + p, 0),
    [costs]
  );
  const totalActual = useMemo(
    () => costs.reduce((p, c) => (c.actualCost || 0) + p, 0),
    [costs]
  );

  return (
    <div className='grid grid-cols-4 space-x-2'>
      <div></div>
      <div className='border-none px-4 py-2 focus:border-none focus:outline-none'>
        <span className='text-sm font-light'>total:</span>{" "}
        <span className='font-bold'>{formatter.format(totalEstimate)}</span>
      </div>
      <div className='border-none px-4 py-2 focus:border-none focus:outline-none'>
        <span className='text-sm font-light'>total:</span>{" "}
        <span className='font-bold'>{formatter.format(totalActual)}</span>
      </div>
      <div className='border-none px-4 py-2 focus:border-none focus:outline-none'>
        <span className='text-sm font-light'>total:</span>{" "}
        <span className='font-bold'>
          {formatter.format(totalEstimate - totalActual)}
        </span>
      </div>
    </div>
  );
};

export default CostSummaryRow;
