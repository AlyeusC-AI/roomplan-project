import { ReactNode } from 'react'
import { SubscriptionStatus } from '@servicegeek/db'

import Content from './Content'
import Header from './Header'

export default function AppContainer({
  overflow = true,
  children,
  hideParentNav = false,
  renderSecondaryNavigation,
  skeleton = false,
  subscriptionStatus,
}: {
  overflow?: boolean
  children: React.ReactNode
  hideParentNav?: boolean
  renderSecondaryNavigation?: () => React.ReactNode
  skeleton?: boolean
  subscriptionStatus: SubscriptionStatus
}) {
  return (
    <>
      <div className="flex h-full flex-col">
        <Header skeleton={skeleton} />
        <Content
          hideParentNav={hideParentNav}
          overflow={overflow}
          renderSecondaryNavigation={renderSecondaryNavigation}
          subscriptionStatus={subscriptionStatus}
        >
          {children}
        </Content>
      </div>
    </>
  )
}
