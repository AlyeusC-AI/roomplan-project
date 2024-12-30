import { Spinner } from '@components/components'
import clsx from 'clsx'

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  ref?: React.RefObject<HTMLButtonElement>
  loading?: boolean
  variant?: 'danger' | 'base' | 'invert'
  noPadding?: boolean
}

export const PrimaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = 'base', ...rest } = props

  return (
    <button
      type="button"
      className={clsx(
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
          fill={clsx(
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

export const SecondaryButton = (props: ButtonProps) => {
  const { className, children, loading, variant = 'base', ...rest } = props
  return (
    <button
      type="button"
      className={clsx(
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
          bg={clsx(
            variant === 'base' && 'group-hover:text-primary text-gray-200',
            variant === 'danger' && 'group-hover:text-red-800 text-gray-200'
          )}
          fill={clsx(
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

export const TertiaryButton = (props: React.PropsWithChildren<ButtonProps>) => {
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
      className={clsx(
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
          bg={clsx(
            variant === 'base' && 'group-hover:text-blue-800 text-white',
            variant === 'danger' && 'group-hover:text-red-800 text-red-200'
          )}
          fill={clsx(
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