import clsx from 'clsx'

import * as Headings from './Headings'

export interface ParagraphProps extends React.ComponentPropsWithoutRef<'p'> {}

export const Base = ({ className, children }: ParagraphProps) => (
  <p className={clsx('text-base sm:text-sm', className)}>{children}</p>
)

const Typeography = { ...Headings, Base }

export default Typeography
