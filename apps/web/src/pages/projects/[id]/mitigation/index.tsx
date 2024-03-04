import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import Readings from '@components/Project/Readings'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import {
  getRoomList,
  RoomDataWithoutInferences,
} from '@restorationx/db/queries/project/getProjectDetections'
import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
import getRoomReadings from '@restorationx/db/queries/room/reading/getRoomReadings'
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
import { trpc } from '@utils/trpc'
import { RouterOutputs } from '@restorationx/api'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'

interface EstimatePageProps {
  user: User
  userInfo: UserInfo
  error?: string
  rooms: RoomDataWithoutInferences[]
  subscriptionStatus: SubscriptionStatus
  roomReadings: RouterOutputs['readings']['getAll']
  orgInfo: OrgInfo
  projectInfo: ProjectInfo
}

const tabs = (id: string) => [
  { name: 'Readings', href: `/projects/${id}/mitigation` },
  { name: 'Notes', href: `/projects/${id}/mitigation/notes` },
  { name: 'Scope', href: `/projects/${id}/mitigation/scope` },
  { name: 'Equipment', href: `/projects/${id}/mitigation/equipment` },
]

const EstimatePage: NextPage<EstimatePageProps> = ({
  userInfo,
  rooms,
  subscriptionStatus,
  roomReadings,
  orgInfo,
  projectInfo,
}) => {
  const router = useRouter()
  trpc.readings.getAll.useQuery(
    { projectPublicId: router.query.id as string },
    { initialData: roomReadings }
  )
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
          <meta name="description" content="Project Estimate and Details" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Readings />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default EstimatePage

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

    const roomList = await getRoomList(ctx.query.id, orgId)
    const rooms = roomList?.rooms || []
    const subscriptionStatus = await getSubcriptionStatus(user.id)
    const roomReadings = (await getRoomReadings(user.id, ctx.query.id)) || []

    return {
      props: {
        rooms,
        userInfo: getUserInfo(user),
        subscriptionStatus,
        roomReadings: superjson.serialize(roomReadings).json,
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
