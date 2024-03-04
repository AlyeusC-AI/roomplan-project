import { RefObject } from 'react'
import classNames from '@utils/classNames'

export interface LinkProps extends React.ComponentPropsWithoutRef<'a'> {
  ref?: RefObject<HTMLAnchorElement>
  variant?: 'invert' | 'swag' | 'base' | 'invert-swag'
}

const PrimaryLink = (props: LinkProps) => {
  const { className, variant = 'base', ...rest } = props
  return (
    <a
      className={classNames(
        'inline-flex items-center justify-center rounded-md  shadow-sm  hover:cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2',
        'text-sm font-medium',
        'text-center',
        'py-2 px-2',
        variant === 'base' &&
          'border border-primary-action bg-primary-action text-white hover:bg-primary-action-hover focus:ring-primary-action',
        variant === 'invert' &&
          'border border-primary-action bg-white text-black hover:border-white hover:bg-primary-action hover:text-white  focus:ring-primary-action',
        variant === 'swag' &&
          'border border-transparent bg-gradient-to-br from-swag-dark to-swag-light text-white hover:shadow-lg',
        variant === 'invert-swag' &&
          'border border-primary-action bg-white text-black hover:border-transparent hover:bg-gradient-to-br hover:from-swag-dark hover:to-swag-light hover:text-white hover:shadow-lg',
        className
      )}
      {...rest}
    />
  )
}

export default PrimaryLink
