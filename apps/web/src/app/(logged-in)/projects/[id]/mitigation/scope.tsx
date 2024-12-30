import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import Scope from '@components/Project/Scope'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import {
  getInferenceList,
  getRoomList,
  RoomData,
  RoomDataWithoutInferences,
} from '@servicegeek/db/queries/project/getProjectDetections'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import { User } from '@supabase/supabase-js'

export interface uploadInProgressImages {
  path: string
  name: string
}

interface ScopePageProps {
  user: User
  userInfo: UserInfo
  accessToken: string
  error?: string
  inferences?: RoomData[]
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  rooms: RoomDataWithoutInferences[]
}

const tabs = (id: string) => [
  { name: 'Readings', href: `/projects/${id}/mitigation` },
  { name: 'Notes', href: `/projects/${id}/mitigation/notes` },
  { name: 'Scope', href: `/projects/${id}/mitigation/scope` },
  { name: 'Equipment', href: `/projects/${id}/mitigation/equipment` },
]

const ScopePage: NextPage<ScopePageProps> = ({
  userInfo,
  inferences,
  projectInfo,
  subscriptionStatus,
  orgInfo,
  rooms,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        inferences,
        userInfo,
        orgInfo,
        projectInfo,
        rooms,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Estimate</title>
          <meta name="description" content="Project Estimate and Details" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Scope />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default ScopePage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel, accessToken } = await getUserWithAuthStatus(
      ctx
    )

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
    let project = await getProjectForOrg(ctx.query.id, orgId)
    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const [inferenceList, subscriptionStatus, roomList] =
      await await Promise.all([
        getInferenceList(ctx.query.id, orgId),
        getSubcriptionStatus(user.id),
        getRoomList(ctx.query.id, orgId),
      ])

    const inferences = inferenceList?.rooms || []
    const rooms = roomList?.rooms || []

    return {
      props: {
        rooms,
        inferences,
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
