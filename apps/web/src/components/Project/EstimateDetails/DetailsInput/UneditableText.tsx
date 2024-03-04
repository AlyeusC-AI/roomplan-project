import { ReactNode } from 'react'

const UneditableText = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-gray-900 ">{children}</p>
)

export default UneditableText
