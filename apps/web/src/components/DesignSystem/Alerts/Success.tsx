import { ReactNode } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function Success({
  title = 'Success',
  children,
}: {
  title?: string
  children?: React.ReactNode
}) {
  return (
    <div className="my-4 rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="mt-1 flex flex-shrink-0 items-start justify-center">
          <CheckCircleIcon
            className="h-5 w-5 text-green-400"
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          {children && (
            <div className="mt-2 text-sm text-green-700">{children}</div>
          )}
        </div>
      </div>
    </div>
  )
}
