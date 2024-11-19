import { ReactNode } from 'react'

const InputLabel = ({
  htmlFor,
  children,
  className,
}: {
  htmlFor: string
  children: React.ReactNode
  className?: string
}) => (
  <label
    htmlFor={htmlFor}
    className={`block text-sm font-medium text-gray-700 ${
      className ? className : ''
    }`}
  >
    {children}
  </label>
)

export default InputLabel
