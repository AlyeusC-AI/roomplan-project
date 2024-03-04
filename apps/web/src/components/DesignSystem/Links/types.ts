import { RefObject } from 'react'

export interface LinkProps extends React.ComponentPropsWithoutRef<'a'> {
  ref?: RefObject<HTMLAnchorElement>
}
