import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import Notes from '@components/Project/Notes'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import {
  getRoomListWithNotes,
  RoomDataWithoutInferences,
} from '@restorationx/db/queries/project/getProjectDetections'
import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@restorationx/db'
import { User } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'

interface NotesProps {
  user: User
  userInfo: UserInfo
  error?: string
  rooms: RoomDataWithoutInferences[]
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  projectInfo: ProjectInfo
}

const tabs = (id: string) => [
  { name: 'Readings', href: `/projects/${id}/mitigation` },
  { name: 'Notes', href: `/projects/${id}/mitigation/notes` },
  { name: 'Scope', href: `/projects/${id}/mitigation/scope` },
  { name: 'Equipment', href: `/projects/${id}/mitigation/equipment` },
]

const NotesPages: NextPage<NotesProps> = ({
  userInfo,
  rooms,
  subscriptionStatus,
  orgInfo,
  projectInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        rooms,
        userInfo,
        orgInfo,
        projectInfo,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>RestorationX - Estimate</title>
          <meta name="description" content="Project Notes" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Notes />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default NotesPages

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel } = await getUserWithAuthStatus(ctx)

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

    const roomList = await getRoomListWithNotes(ctx.query.id, orgId)
    const rooms = roomList?.rooms
      ? superjson.serialize(roomList.rooms).json
      : []
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    return {
      props: {
        rooms,
        userInfo: getUserInfo(user),
        subscriptionStatus,
        orgInfo: getOrgInfo(user),
        projectInfo: getProjectInfo(project),
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
