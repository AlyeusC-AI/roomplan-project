import { ReactNode } from 'react'
import clsx from 'clsx'

export type PILL_COLOR = 'blue' | 'red' | 'green' | 'orange' | 'yellow' | 'none'
export const SupportedColors = [
  'cyan',
  'blue',
  'red',
  'green',
  'orange',
  'yellow',
  'none',
  'gray',
  'pink',
  'purple',
]
const Pill = ({
  color,
  children,
  className,
  size = 'xs',
}: {
  color: string
  children: React.ReactNode
  className?: string
  size?: 'xs' | 'sm'
}) => (
  <span
    className={clsx(
      className,
      `font-semibold`,
      size === 'xs' && 'text-xs',
      size === 'sm' && 'text-lg',
      color === 'cyan' && 'bg-cyan-200 text-cyan-800',
      color === 'blue' && 'bg-blue-200 text-blue-800',
      color === 'red' && 'bg-red-200 text-red-800',
      color === 'pink' && 'bg-pink-200 text-pink-800',
      color === 'green' && 'bg-green-200 text-green-800',
      color === 'orange' && 'bg-orange-200 text-orange-800',
      color === 'yellow' && 'bg-yellow-200 text-yellow-800',
      color === 'purple' && 'bg-purple-200 text-purple-800',
      color === 'gray' && 'bg-gray-200 text-gray-800',
      color === 'none' ? 'text-gray-500' : 'rounded-full py-1 px-2'
    )}
  >
    {children}
  </span>
)

export default Pill
