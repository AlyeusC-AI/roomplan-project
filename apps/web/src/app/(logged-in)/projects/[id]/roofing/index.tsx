import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import Roofing from '@components/Project/Roofing'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import {
  getInferenceList,
  RoomData,
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
import getPresignedUrlMapFromFileObjectList from '@lib/supabase/getPresignedUrlMapFromFileObjectList'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { SubscriptionStatus } from '@servicegeek/db'
import { FileObject } from '@supabase/storage-js'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

import { PresignedUrlMap } from '../photos'
import { User } from '@supabase/supabase-js'

export interface uploadInProgressImages {
  path: string
  name: string
}

interface RoofingPageProps {
  user: User
  userInfo: UserInfo
  accessToken: string
  error?: string
  inferences?: RoomData[]
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  projectFiles: FileObject[]
}

const tabs = (id: string) => [
  { name: 'Report', href: `/projects/${id}/roofing` },
  { name: '3D', href: `/projects/${id}/roofing-3d` },
]

const RoofingPage: NextPage<RoofingPageProps> = ({
  accessToken,
  userInfo,
  inferences,
  projectFiles,
  projectInfo,
  subscriptionStatus,
  orgInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        inferences,
        userInfo,
        orgInfo,
        projectFiles,
        projectInfo,
        subscriptionStatus,
      })}
    >
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Roofing</title>
          <meta name="description" content="Project roofing estimate" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Roofing accessToken={accessToken} />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default RoofingPage

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

    const inferenceList = await getInferenceList(ctx.query.id, orgId)

    const inferences = inferenceList?.rooms || []
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    let files: FileObject[] = []
    let presignedUrlMap: PresignedUrlMap = {}
    if (accessToken) {
      const { data, error } = await supabaseServiceRole.storage
        .from('user-files')
        .list(`${user.org?.organization.publicId}/${ctx.query.id}/`, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        })

      if (data) files = data

      files = files.filter((f) => f.name !== '.emptyFolderPlaceholder')
      presignedUrlMap = await getPresignedUrlMapFromFileObjectList(
        files,
        `${user.org?.organization.publicId}/${ctx.query.id}/`,
        'user-files'
      )
    }
    return {
      props: {
        inferences,
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
        projectFiles: files,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
