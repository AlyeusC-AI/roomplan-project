import Spinner from '@components/Spinner'
import classNames from '@utils/classNames'

import { ButtonProps } from './types'

const TertiaryButton = (props: ButtonProps) => {
  const {
    className,
    children,
    loading,
    variant = 'base',
    noPadding = false,
    ...rest
  } = props
  return (
    <button
      type="button"
      className={classNames(
        'inline-flex items-center justify-center rounded-md border border-transparent text-sm font-medium sm:w-auto',
        variant === 'base' &&
          'text-primary  hover:bg-primary-action-hover  hover:text-white focus:ring-primary-action',
        variant === 'danger' &&
          'text-gray-500 hover:text-red-600 focus:ring-red-500',
        className,
        rest.disabled && 'opacity-60',
        !noPadding &&
          'py-2 px-2 focus:outline-none focus:ring-2 focus:ring-offset-2',
        noPadding && ' hover:bg-inherit hover:text-inherit hover:underline'
      )}
      {...rest}
    >
      {loading ? (
        <Spinner
          bg={classNames(
            variant === 'base' && 'group-hover:text-blue-800 text-white',
            variant === 'danger' && 'group-hover:text-red-800 text-red-200'
          )}
          fill={classNames(
            variant === 'base' && 'group-hover:fill-white fill-blue-600',
            variant === 'danger' && 'group-hover:fill-white fill-red-600'
          )}
        />
      ) : (
        children
      )}
    </button>
  )
}

export default TertiaryButton
