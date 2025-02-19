"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import debounce from "lodash.debounce";
import { useParams } from "next/navigation";
import { costsStore } from "@atoms/costs";
import { Card } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { toast } from "sonner";
// Create our number formatter.
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const TotalsTable = ({ rcvValue }: { rcvValue: number }) => {
  const [rv, setRv] = useState<string | undefined>(
    rcvValue ? formatter.format(rcvValue) : ""
  );

  const materialCosts = costsStore((state) => state.materialsCosts);
  const subcontractorCosts = costsStore((state) => state.subcontractorCosts);
  const miscellaneousCosts = costsStore((state) => state.miscellaneousCosts);

  const costs = useMemo(
    () => [...materialCosts, ...subcontractorCosts, ...miscellaneousCosts],
    [materialCosts, subcontractorCosts, miscellaneousCosts]
  );

  const totalActual = useMemo(
    () => costs.reduce((p, c) => (c.actualCost || 0) + p, 0),
    [costs]
  );

  const { id } = useParams();

  const saveValue = async (rcvValue: string) => {
    const stripped = rcvValue.replaceAll(",", "").replaceAll("$", "");
    const v = stripped ? parseFloat(stripped) : 0;
    try {
      await fetch(`/api/v1/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ rcvValue: v }),
      });

      toast.success("Updated project successfully");
    } catch (error) {
      toast.error("Failed to update project");
      console.error(error);
    }
  };

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    await saveValue(e.target.value);
  };

  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), []);

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel();
    };
  }, []);

  const strippedRv = rv?.replaceAll(",", "").replaceAll("$", "");

  return (
    <dl className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3'>
      {/* <div className='overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6'>
        
      </div> */}
      <Card className='p-3'>
        <dt className='truncate text-sm font-medium text-gray-500'>
          Total Estimate Amount
        </dt>
        <dd className='mt-1 text-3xl font-semibold tracking-tight text-foreground'>
          {/* TODO: Input field */}
          {/* {formatter.format(totalEstimate)} */}
          <input
            className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
            value={rv || ""}
            onBlur={(e) => {
              const stripped = e.target.value
                .replaceAll(",", "")
                .replaceAll("$", "");
              const formatted = formatter.format(parseFloat(stripped));
              if (isNaN(parseFloat(stripped))) {
                setRv(undefined);
              } else {
                setRv(formatted);
              }
            }}
            placeholder='Click to set amount'
            onChange={(
              e:
                | ChangeEvent<HTMLInputElement>
                | ChangeEvent<HTMLTextAreaElement>
            ) => {
              debouncedChangeHandler(e);
              setRv(e.target.value);
            }}
          />
        </dd>
      </Card>
      {/* <div className='overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6'>
        
      </div> */}
      <Card className='p-3'>
        <dt className='truncate text-sm font-medium text-gray-500'>
          Total Contracted Cost
        </dt>
        <dd className='mt-3 text-3xl font-semibold tracking-tight text-foreground'>
          {formatter.format(totalActual)}
        </dd>
      </Card>
      {/* <div className='overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6'>
        
      </div> */}
      <Card className='p-3'>
        <dt className='truncate text-sm font-medium text-gray-500'>
          Total Difference
        </dt>
        {strippedRv && !isNaN(parseFloat(strippedRv)) ? (
          <div className='mt-3 flex justify-between'>
            <dd
              className={clsx(
                "text-3xl font-semibold tracking-tight",
                parseFloat(strippedRv) - totalActual === 0 && "text-gray-900",
                parseFloat(strippedRv) - totalActual < 0 && "text-red-700",
                parseFloat(strippedRv) - totalActual > 0 && "text-green-700"
              )}
            >
              {formatter.format(parseFloat(strippedRv) - totalActual)}
            </dd>
            {parseFloat(strippedRv) > 0 &&
              parseFloat(strippedRv) - totalActual > 0 && (
                <Badge color='green'>
                  {(
                    ((parseFloat(strippedRv) - totalActual) /
                      parseFloat(strippedRv)) *
                    100
                  ).toFixed(2)}
                  %
                </Badge>
              )}
            {parseFloat(strippedRv) > 0 &&
              parseFloat(strippedRv) - totalActual < 0 && (
                <Badge variant='default'>
                  {(
                    ((parseFloat(strippedRv) - totalActual) /
                      parseFloat(strippedRv)) *
                    100
                  ).toFixed(2)}
                  %
                </Badge>
              )}
          </div>
        ) : (
          <div className='text-3xl font-semibold tracking-tight'>--</div>
        )}
      </Card>
    </dl>
  );
};

export default TotalsTable;
