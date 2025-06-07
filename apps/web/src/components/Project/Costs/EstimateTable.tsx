import { useState } from "react";
import clsx from "clsx";
import { useParams } from "next/navigation";
// Create our number formatter.
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const EstimateTable = ({
  rcvValue,
  actualValue,
}: {
  rcvValue: number;
  actualValue: number;
}) => {
  const [rv, setRv] = useState(rcvValue);
  const [av, setAv] = useState(actualValue);

  const { id } = useParams<{ id: string }>();

  // const saveValue = async (data: {
  //   rcvValue?: number;
  //   actualValue?: number;
  // }) => {
  //   try {
  //     if (data.rcvValue) {
  //       setRv(data.rcvValue);
  //     } else if (data.actualValue) {
  //       setAv(data.actualValue);
  //     } else {
  //       return;
  //     }
  //     await fetch(`/api/project/${id}/value`, {
  //       method: "PATCH",
  //       body: JSON.stringify({
  //         data: data,
  //       }),
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <div className='grid grid-cols-3 space-x-2'>
      {/* <AutoSaveTextInput
        className='border-none py-2 focus:border-none focus:outline-none'
        defaultValue={rcvValue}
        onSave={(v) => saveValue({ rcvValue: parseFloat(v) })}
        placeholder='RCV Value'
        ignoreInvalid
        title='RCV Value'
        name='RCV Value'
        units='$'
        type='number'
      />
      <AutoSaveTextInput
        className='border-none py-2 focus:border-none focus:outline-none'
        defaultValue={actualValue}
        onSave={(v) => saveValue({ actualValue: parseFloat(v) })}
        placeholder='Actual Value'
        ignoreInvalid
        title='Actual Value'
        name='Actual Value'
        units='$'
        type='number'
      /> */}
      <div className='border-none py-2 focus:border-none focus:outline-none'>
        <label
          htmlFor='Difference'
          className='block text-sm font-medium text-gray-700'
        >
          Difference
        </label>
        <div className='relative mt-1 rounded-md bg-white p-2 shadow-sm'>
          <div className='block w-full rounded-md border-gray-300 pr-12 text-sm'>
            {formatter.format(rv - av)}
          </div>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
            <span
              className={clsx("flex flex-row-reverse text-gray-500 sm:text-sm")}
            >
              <>$</>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EstimateTable;
