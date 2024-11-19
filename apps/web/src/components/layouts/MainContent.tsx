import userInfoState from '@atoms/userInfoState'
import { DashboardViews } from '@servicegeek/db'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { ReactNode } from 'react'
import { useRecoilState } from 'recoil'

const MainContent = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  const [userInfo] = useRecoilState(userInfoState)
  const router = useRouter()
  return (
    <div
      className={clsx(
        'flex flex-col px-8 pt-4',
        router.route === '/projects'
          ? userInfo && userInfo.savedDashboardView !== DashboardViews.boardView
            ? 'overflow-scroll'
            : 'overflow-hidden'
          : 'overflow-scroll',
        className
      )}
    >
      {children}
    </div>
  )
}

export default MainContent
