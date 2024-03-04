import { ReactNode } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'

export default function Error({
  title = 'Error',
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <div className="my-4 rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="mt-1 flex flex-shrink-0 items-start justify-center">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-2 text-sm text-red-700">{children}</div>
        </div>
      </div>
    </div>
  )
}
