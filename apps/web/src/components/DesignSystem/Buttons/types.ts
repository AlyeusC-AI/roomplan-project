import { RefObject } from 'react'

export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
  ref?: RefObject<HTMLButtonElement>
  loading?: boolean
  variant?: 'danger' | 'base' | 'invert'
  noPadding?: boolean
}
