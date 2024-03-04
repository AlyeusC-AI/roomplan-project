import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import Pill from '@components/DesignSystem/Pills/Pill'
import clsx from 'clsx'
import debounce from 'lodash.debounce'
import { useRouter } from 'next/router'
import { useRecoilState } from 'recoil'
import {
  materialsCostsState,
  miscellaneousCostsState,
  subcontractorCostsState,
} from '@atoms/costsState'
// Create our number formatter.
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

const TotalsTable = ({
  rcvValue,
  actualValue,
}: {
  rcvValue: number
  actualValue: number
}) => {
  const [rv, setRv] = useState<string | undefined>(
    rcvValue ? formatter.format(rcvValue) : ''
  )

  const [materialCosts] = useRecoilState(materialsCostsState)
  const [subcontractorCosts] = useRecoilState(subcontractorCostsState)
  const [miscellaneousCosts] = useRecoilState(miscellaneousCostsState)

  const costs = useMemo(
    () => [...materialCosts, ...subcontractorCosts, ...miscellaneousCosts],
    [materialCosts, subcontractorCosts, miscellaneousCosts]
  )

  const totalActual = useMemo(
    () => costs.reduce((p, c) => (c.actualCost || 0) + p, 0),
    [costs]
  )

  const router = useRouter()

  const saveValue = async (rcvValue: string) => {
    const stripped = rcvValue.replaceAll(',', '').replaceAll('$', '')
    const v = stripped ? parseFloat(stripped) : 0
    try {
      await fetch(`/api/project/${router.query.id}/value`, {
        method: 'PATCH',
        body: JSON.stringify({
          data: { rcvValue: v },
        }),
      })
    } catch (error) {
      console.error(error)
    }
  }

  const saveHandler = async (
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    await saveValue(e.target.value)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useMemo(() => debounce(saveHandler, 500), [])

  useEffect(() => {
    return () => {
      debouncedChangeHandler.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const strippedRv = rv?.replaceAll(',', '').replaceAll('$', '')

  return (
    <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-gray-500">
          Total Estimate Amount
        </dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          {/* TODO: Input field */}
          {/* {formatter.format(totalEstimate)} */}
          <input
            className="w-full border-b border-gray-100 placeholder:text-sm"
            value={rv || ''}
            onBlur={(e) => {
              const stripped = e.target.value
                .replaceAll(',', '')
                .replaceAll('$', '')
              const formatted = formatter.format(parseFloat(stripped))
              if (isNaN(parseFloat(stripped))) {
                setRv(undefined)
              } else {
                setRv(formatted)
              }
            }}
            placeholder="Click to set amount"
            onChange={(
              e:
                | ChangeEvent<HTMLInputElement>
                | ChangeEvent<HTMLTextAreaElement>
            ) => {
              const input = e.target.value
              debouncedChangeHandler(e)
              setRv(e.target.value)
            }}
          />
        </dd>
      </div>
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-gray-500">
          Total Contracted Cost
        </dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
          {formatter.format(totalActual)}
        </dd>
      </div>
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
        <dt className="truncate text-sm font-medium text-gray-500">
          Total Difference
        </dt>
        {strippedRv && !isNaN(parseFloat(strippedRv)) ? (
          <>
            <dd
              className={clsx(
                'mt-1 text-3xl font-semibold tracking-tight',
                parseFloat(strippedRv) - totalActual === 0 && 'text-gray-900',
                parseFloat(strippedRv) - totalActual < 0 && 'text-red-700',
                parseFloat(strippedRv) - totalActual > 0 && 'text-green-700'
              )}
            >
              {formatter.format(parseFloat(strippedRv) - totalActual)}
            </dd>
            {parseFloat(strippedRv) > 0 &&
              parseFloat(strippedRv) - totalActual > 0 && (
                <Pill color="green" size="sm">
                  {(
                    ((parseFloat(strippedRv) - totalActual) /
                      parseFloat(strippedRv)) *
                    100
                  ).toFixed(2)}
                  %
                </Pill>
              )}
            {parseFloat(strippedRv) > 0 &&
              parseFloat(strippedRv) - totalActual < 0 && (
                <Pill color="red" size="sm">
                  {(
                    ((parseFloat(strippedRv) - totalActual) /
                      parseFloat(strippedRv)) *
                    100
                  ).toFixed(2)}
                  %
                </Pill>
              )}
          </>
        ) : (
          <div className="mt-1 text-3xl font-semibold tracking-tight">--</div>
        )}
        {/* TODO: Show percentage  */}
      </div>
    </dl>
  )
}

export default TotalsTable
