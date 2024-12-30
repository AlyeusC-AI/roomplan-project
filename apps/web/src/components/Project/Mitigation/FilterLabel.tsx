import { ReactNode } from 'react'

const FilterLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-2 text-xs font-semibold uppercase text-neutral-600">
    {children}
  </div>
)

export default FilterLabel
