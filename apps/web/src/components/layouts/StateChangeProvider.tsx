import { ReactNode } from 'react'
import Router from 'next/router'
import NProgress from 'nprogress'

import 'focus-visible'

// Route Events.
Router.events.on('routeChangeStart', () => NProgress.start())
Router.events.on('routeChangeComplete', () => NProgress.done())
Router.events.on('routeChangeError', () => NProgress.done())
NProgress.configure({ showSpinner: false })

export default function StateChangeProvider({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}
