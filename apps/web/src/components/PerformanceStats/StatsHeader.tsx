import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { ProjectStats } from '@pages/projects'

const INCREASED = 'INCREASED'
const DECREASED = 'DECREASED'
const NO_CHANGE = 'NO_CHANGE'

const Stat = ({
  title,
  stats: { cur, prev },
}: {
  title: string
  stats: { cur: number; prev: number }
}) => {
  let changeType = INCREASED
  if (cur < prev) {
    changeType = DECREASED
  } else if (cur === prev) {
    changeType = NO_CHANGE
  }
  return (
    <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
      <dt className="text-base font-normal text-gray-900">{title}</dt>
      <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
        <div className="flex items-baseline text-2xl font-semibold text-primary">
          {cur}
          <span className="ml-2 text-sm font-medium text-gray-500">
            from {prev}
          </span>
        </div>

        <div
          className={clsx(
            changeType === INCREASED && 'bg-green-100 text-green-800',
            changeType === DECREASED && 'bg-red-100 text-red-800',
            'inline-flex items-baseline rounded-full px-2.5 py-0.5 text-sm font-medium md:mt-2 lg:mt-0'
          )}
        >
          {changeType === INCREASED && (
            <ArrowUpIcon
              className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-green-500"
              aria-hidden="true"
            />
          )}
          {changeType === DECREASED && (
            <ArrowDownIcon
              className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0 self-center text-red-500"
              aria-hidden="true"
            />
          )}

          {changeType === NO_CHANGE ? (
            <>--</>
          ) : (
            <>
              <span className="sr-only">
                {changeType === INCREASED ? 'Increased' : 'Decreased'} by{' '}
              </span>
              {cur - prev}
            </>
          )}
        </div>
      </dd>
    </div>
  )
}

export default function StatsHeader({
  projectStats,
}: {
  projectStats: ProjectStats
}) {
  return (
    <div className="mb-4 ">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Last 30 days
      </h3>
      <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-5">
        <Stat title="Opened Jobs" stats={projectStats.openedProjects} />
        <Stat title="Closed Jobs" stats={projectStats.closedProjects} />
      </dl>
    </div>
  )
}
