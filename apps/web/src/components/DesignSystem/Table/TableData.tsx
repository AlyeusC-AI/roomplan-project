import { ReactNode } from 'react'
import clsx from 'clsx'

const TableData = ({
  children,
  important = false,
  noClass = false,
}: {
  children: ReactNode
  important?: boolean
  noClass?: boolean
}) => {
  if (noClass) {
    return <td>{children}</td>
  }
  return (
    <td
      className={clsx(
        important &&
          'whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6',
        !important && 'whitespace-nowrap px-3 py-4 text-sm text-gray-500'
      )}
    >
      {children}
    </td>
  )
}

export default TableData
