import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import PerformanceStats from '@components/PerformanceStats'
import OrgCreation from '@components/Projects/OrgCreation'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getProjectStats from '@servicegeek/db/queries/project/getProjectStats'
import getProjectsData from '@lib/pages/getProjectsData'
import { getQueueTime } from '@lib/qstash/queueInference'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import { ORG_ACCESS_LEVEL } from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import { User } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import Script from 'next/script'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

export interface InviteStatus {
  accepted: boolean
  organizationName: string
  inviteId: string
}

export interface ProjectStats {
  openedProjects: { cur: number; prev: number }
  closedProjects: { cur: number; prev: number }
}
interface PerformancePageProps {
  error?: string
  user: User
  orgId?: string | null
  subscriptionStatus: SubscriptionStatus
  userInfo: UserInfo
  orgInfo: OrgInfo
  projectStats: ProjectStats
  totalProjects: number
}

const PerformancePage: NextPage<PerformancePageProps> = ({
  orgId,
  subscriptionStatus,
  userInfo,
  orgInfo,
  projectStats,
  totalProjects,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
      })}
    >
      <AppContainer subscriptionStatus={subscriptionStatus}>
        <Head>
          <title>ServiceGeek - Dashboard</title>
          <meta
            name="description"
            content="Access projects that you have integrated with ServiceGeek"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Script id="11015712809/KQdPCLiI94AYEKng2YQp">
          {`gtag('event', 'conversion', {'send_to': 'AW-11015712809/KQdPCLiI94AYEKng2YQp'});`}
        </Script>
        <MainContent>
          <>
            {subscriptionStatus === SubscriptionStatus.past_due && (
              <TrailEndedBanner />
            )}
            {orgId ? (
              <PerformanceStats
                projectStats={projectStats}
                totalProjects={totalProjects}
              />
            ) : (
              <OrgCreation />
            )}
          </>
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default PerformancePage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    let now,
      end = 0
    now = performance.now()
    const { user, orgAccessLevel } = await getProjectsData(ctx)

    getQueueTime()

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    if (orgAccessLevel === ORG_ACCESS_LEVEL.REMOVED) {
      return {
        redirect: {
          destination: '/access-revoked',
          permanent: false,
        },
      }
    }

    const publicOrgId = user.org?.organization.publicId || null
    let totalProjects = 0
    if (user.org?.organization.id) {
      totalProjects = user.org.organization._count.projects
    }
    const subscriptionStatus = await getSubcriptionStatus(user.id)
    const projectStats = await getProjectStats(user.org?.organization.id!)
    end = performance.now()
    return {
      props: {
        orgId: publicOrgId,
        totalProjects,
        subscriptionStatus,
        projectStats,
        userInfo: getUserInfo(user),
        orgInfo: getOrgInfo(user),
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
