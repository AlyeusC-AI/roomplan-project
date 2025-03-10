import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import FirstTimePhotos from '@components/Onboarding/FirstTimePhotos'
import Mitigation from '@components/Project/Mitigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import {
  getInferenceList,
  getRoomList,
  RoomData,
  RoomDataWithoutInferences,
} from '@servicegeek/db/queries/project/getProjectDetections'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import getOrgInfo from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import getPresignedUrlMapFromInferenceList from '@lib/supabase/getPresignedUrlMapFromInferenceList'
import { GroupByViews, PhotoViews, SubscriptionStatus } from '@servicegeek/db'
import { trpc } from '@utils/trpc'
import {
  OnlySelectedFilterQueryParam,
  RoomsFilterQueryParam,
  SortDirectionQueryParam,
} from '@utils/types'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import getMembers from '@servicegeek/db/queries/organization/getMembers'
import superjson from 'superjson'
import { Member } from '@components/Settings/Organization/types'
import { User } from '@supabase/supabase-js'

export interface uploadInProgressImages {
  path: string
  name: string
}

export interface PresignedUrlMap {
  [imageKey: string]: string
}

interface EstimatePageProps {
  user: User
  userInfo: UserInfo
  accessToken: string
  error?: string
  inferences?: RoomData[]
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  rooms: RoomDataWithoutInferences[]
  urlMap: PresignedUrlMap
  initialPhotoView: PhotoViews
  initialGroupView: GroupByViews
  teamMembers: Member[]
}

const tabs = (id: string) => [
  { name: 'Photos', href: `/projects/${id}/photos` },
]

const EstimatePage: NextPage<EstimatePageProps> = ({
  accessToken,
  userInfo,
  inferences,
  projectInfo,
  subscriptionStatus,
  orgInfo,
  rooms,
  urlMap,
  teamMembers,
  initialPhotoView,
  initialGroupView,
}) => {
  trpc.photoView.getPhotoView.useQuery(undefined, {
    initialData: { photoView: initialPhotoView },
  })
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        inferences,
        userInfo,
        orgInfo,
        projectInfo,
        rooms,
        urlMap,
        teamMembers,
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
          <Mitigation
            accessToken={accessToken}
            initialGroupView={initialGroupView}
            initialPhotoView={initialPhotoView}
          />
        </MainContent>
        <FirstTimePhotos />
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

    const { rooms, onlySelected, sortDireciton } = ctx.query
    let parsedRooms: string[] | undefined = undefined
    let parsedOnlySelected: boolean | undefined = undefined
    let parsedSortDirection: 'asc' | 'desc' | undefined = undefined

    if (rooms) {
      try {
        parsedRooms = RoomsFilterQueryParam.parse(JSON.parse(rooms as string))
      } catch (e) {
        console.error(e)
      }
    }

    if (onlySelected) {
      try {
        parsedOnlySelected = OnlySelectedFilterQueryParam.parse(
          JSON.parse(onlySelected as string)
        )
      } catch (e) {
        console.error(e)
      }
    }

    if (sortDireciton) {
      try {
        parsedSortDirection = SortDirectionQueryParam.parse(
          JSON.parse(sortDireciton as string)
        )
      } catch (e) {
        console.error(e)
      }
    }

    const [project, inferenceList, subscriptionStatus, roomList] =
      await Promise.all([
        getProjectForOrg(ctx.query.id, orgId),
        getInferenceList(
          ctx.query.id,
          orgId,
          parsedRooms,
          parsedOnlySelected,
          parsedSortDirection
        ),
        getSubcriptionStatus(user.id),
        getRoomList(ctx.query.id, orgId),
      ])

    const urlMap = !inferenceList
      ? {}
      : // @ts-expect-error it's ok
        await getPresignedUrlMapFromInferenceList(inferenceList)

    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const inferences = inferenceList?.rooms || []
    const roomArr = roomList?.rooms || []
    console.log(inferences)

    const members = (await getMembers(orgId)) as unknown as Member[]
    const serializedMembers = superjson.serialize(members)

    return {
      props: {
        rooms: roomArr,
        inferences,
        teamMembers: serializedMembers.json as unknown as Member[],
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
        urlMap,
        initialPhotoView: user.photoView || PhotoViews.photoListView,
        initialGroupView: user.groupView || GroupByViews.dateView,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
