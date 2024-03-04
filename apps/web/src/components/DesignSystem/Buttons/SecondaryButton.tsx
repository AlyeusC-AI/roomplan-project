import Spinner from '@components/Spinner'
import classNames from '@utils/classNames'

import { ButtonProps } from './types'

const SecondaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = 'base', ...rest } = props
  return (
    <button
      type="button"
      className={classNames(
        'group inline-flex items-center justify-center rounded-md border border-transparent py-2 px-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'base' &&
          'border-gray-300 bg-gray-50 text-primary hover:bg-gray-100 hover:shadow-md focus:ring-primary-action',
        variant === 'danger' &&
          'border-red-600 text-red-600  hover:bg-red-600 hover:text-white focus:ring-red-500',
        className,
        rest.disabled && 'opacity-60'
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          bg={classNames(
            variant === 'base' && 'group-hover:text-primary text-gray-200',
            variant === 'danger' && 'group-hover:text-red-800 text-gray-200'
          )}
          fill={classNames(
            variant === 'base' && 'group-hover:fill-white fill-primary',
            variant === 'danger' && 'group-hover:fill-white fill-red-600'
          )}
        />
      ) : (
        children
      )}
    </button>
  )
}

export default SecondaryButton
