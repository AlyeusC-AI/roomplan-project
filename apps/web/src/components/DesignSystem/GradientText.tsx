import { ReactNode } from 'react'

const GradientText = ({ children }: { children: ReactNode }) => (
  <span className="bg-gradient-to-br from-swag-dark to-swag-light bg-clip-text text-transparent">
    {children}
  </span>
)
export default GradientText
