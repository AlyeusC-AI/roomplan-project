import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import EstimateDetails from '@components/Project/EstimateDetails'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import { Member } from '@components/Settings/Organization/types'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import { Stakeholders } from '@servicegeek/db/queries/project/getUsersForProject'
import getOverViewData from '@lib/pages/getOverviewData'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getPropertyDataInfo from '@lib/serverSidePropsUtils/getPropertyDataInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import { ORG_ACCESS_LEVEL } from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import { User } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import { PropertyDataInfo } from '@atoms/propertyDataInfoState'
import superjson from 'superjson'

interface EstimatePageProps {
  user: User
  userInfo: UserInfo
  error?: string
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  teamMembers: Member[]
  stakeholders: Stakeholders[]
  propertyDataInfo: PropertyDataInfo
  orgInfo: OrgInfo
}

const tabs = (id: string) => [
  { name: 'Overview', href: `/projects/${id}/overview` },
]

const EstimateDetailsPage: NextPage<EstimatePageProps> = ({
  userInfo,
  projectInfo,
  subscriptionStatus,
  teamMembers,
  stakeholders,
  propertyDataInfo,
  orgInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        projectInfo,
        userInfo,
        teamMembers,
        stakeholders,
        propertyDataInfo,
        orgInfo,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Estimate Details</title>
          <meta name="description" content="Project Estimate and Details" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <EstimateDetails />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default EstimateDetailsPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  let now,
    end = 0
  now = performance.now()
  try {
    if (Array.isArray(ctx.query.id) || !ctx.query.id) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const { user, orgAccessLevel } = await getOverViewData(ctx, ctx.query.id)
    end = performance.now()
    console.log(`/projects/overview checkpoint 1 took ${end - now} ms`)
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
    const orgId = user.org?.organization.id || null
    if (!orgId || !ctx.query.id || Array.isArray(ctx.query.id)) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const project = user.org?.organization.projects[0]
    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const subscriptionStatus = await getSubcriptionStatus(user.id)

    end = performance.now()
    console.log(`/projects/overview took ${end - now} ms`)
    return {
      props: {
        userInfo: getUserInfo(user),
        orgInfo: getOrgInfo(user),
        projectInfo: getProjectInfo(project),
        propertyDataInfo: getPropertyDataInfo(project.propertyData),
        teamMembers: superjson.serialize(user.org?.organization.users).json,
        stakeholders: superjson.serialize(project.projectAssignees).json,
        subscriptionStatus,
      },
    }
  } catch (e) {
    console.log('Returning nothing')
    console.error(e)
    return {
      props: {},
    }
  }
}
