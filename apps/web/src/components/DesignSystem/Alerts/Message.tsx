import { ReactNode } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'

export default function Message({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="my-4 rounded-md bg-gray-100 p-4 shadow-md">
      <div className="flex">
        <div className="mt-1 flex flex-shrink-0 items-start justify-center">
          <BellIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-gray-800">{title}</h3>
          <div className="mt-2 text-sm text-gray-700">{children}</div>
        </div>
      </div>
    </div>
  )
}
