import { ReactNode } from 'react'
import clsx from 'clsx'

const FormContainer = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  return <div className={clsx('mt-10 sm:mt-0', className)}>{children}</div>
}

export default FormContainer
