import { ReactNode } from 'react'
import { Footer } from '@components/LandingPage/Footer'

interface PageContainerProps {
  children: ReactNode
}
const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {children}
      <Footer />
    </div>
  )
}

export default PageContainer
