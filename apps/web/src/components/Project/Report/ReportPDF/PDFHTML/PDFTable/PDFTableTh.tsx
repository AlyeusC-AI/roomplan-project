import { ReactNode } from 'react'
import clsx from 'clsx'

const PDFTableTh = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <th className={clsx('border border-gray-300 bg-gray-100', className)}>
    {children}
  </th>
)

export default PDFTableTh
