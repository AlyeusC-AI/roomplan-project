import { ReactNode } from 'react'
import clsx from 'clsx'

type Props<T> = {
  children: React.ReactNode
  styles?: string
  title: string
  description: string
  childContainerClassNames?: string
}
const Form = <T extends HTMLFormElement>({
  children,
  styles,
  title,
  description,
  childContainerClassNames = '',
}: Props<T>) => {
  return (
    <div className={clsx('mt-5 h-full md:col-span-2 md:mt-0', styles)}>
      <form className="h-full">
        <div className="flex h-full flex-col overflow-hidden border border-gray-300 shadow-md sm:rounded-md">
          <div className="bg-white px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {title}
            </h3>
            <p className="mt-1 mb-1 text-sm text-gray-600">{description}</p>
          </div>
          <div className="flex-grow bg-white px-4 py-5 sm:p-6">
            <div
              className={clsx(
                childContainerClassNames
                  ? childContainerClassNames
                  : 'grid grid-cols-6 gap-6'
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Form
