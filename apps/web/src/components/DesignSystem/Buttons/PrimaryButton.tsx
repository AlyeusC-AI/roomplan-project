import Spinner from '@components/Spinner'
import classNames from '@utils/classNames'

import { ButtonProps } from './types'

const PrimaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = 'base', ...rest } = props

  return (
    <button
      type="button"
      className={classNames(
        'group inline-flex items-center justify-center rounded-md border border-transparent py-2 px-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'base' &&
          'bg-primary-action text-white hover:bg-primary-action-hover focus:ring-primary-action',
        variant === 'danger' &&
          'bg-red-600 text-white hover:bg-red-800 focus:ring-red-500',
        variant === 'invert' &&
          'bg-white text-black hover:bg-neutral-500 focus:ring-white',
        className,
        rest.disabled && 'opacity-60'
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          fill={classNames(
            variant === 'base' && 'text-white fill-primary-action',
            variant === 'invert' && 'fill-white group-hover:fill-gray-300',
            variant === 'danger' && 'fill-red-600 group-hover:fill-red-800'
          )}
          bg="text-white"
        />
      ) : (
        children
      )}
    </button>
  )
}

export default PrimaryButton
