import classNames from '@utils/classNames'

import { LinkProps } from './types'

const SecondaryLink = (props: LinkProps) => {
  const { className, ...rest } = props
  return (
    <a
      className={classNames(
        'inline-flex items-center justify-center  rounded-md border border-blue-600 py-2 px-2 text-sm font-medium text-primary shadow-sm hover:cursor-pointer hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto ',
        className
      )}
      {...rest}
    />
  )
}

export default SecondaryLink
