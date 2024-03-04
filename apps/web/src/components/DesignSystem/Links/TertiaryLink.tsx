import classNames from '@utils/classNames'

import { LinkProps } from './types'

const TertiaryLink = (props: LinkProps) => {
  const { className, ...rest } = props
  return (
    <a
      className={classNames(
        'inline-flex items-center justify-center rounded-md border  border-transparent text-sm font-medium text-primary-action hover:cursor-pointer  hover:underline',
        className
      )}
      {...rest}
    />
  )
}

export default TertiaryLink
