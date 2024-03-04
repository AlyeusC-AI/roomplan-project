import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import Files from '@components/Project/Files'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
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
import { SubscriptionStatus } from '@restorationx/db'
import { User } from '@supabase/auth-helpers-nextjs'
import { FileObject } from '@supabase/storage-js'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

import { PresignedUrlMap } from '../photos'
import Success from '@components/DesignSystem/Alerts/Success'
import { useRouter } from 'next/router'
import { trpc } from '@utils/trpc'
import Message from '@components/DesignSystem/Alerts/Message'

interface FilesPageProps {
  user: User
  accessToken: string
  error?: string
  subscriptionStatus: SubscriptionStatus
  projectFiles: FileObject[]
  userInfo: UserInfo
  orgInfo: OrgInfo
  presignedUrlMap: PresignedUrlMap
  projectInfo: ProjectInfo
}
const tabs = (id: string) => [{ name: 'Files', href: `/projects/${id}/files` }]

const FilesPage: NextPage<FilesPageProps> = ({
  accessToken,
  subscriptionStatus,
  projectFiles,
  userInfo,
  presignedUrlMap,
  orgInfo,
  projectInfo,
}) => {
  const router = useRouter()
  const pendingReports = trpc.pendingReports.getPendingReports.useQuery({
    publicProjectId: router.query.id as string,
  })

  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        projectFiles,
        userInfo,
        orgInfo,
        urlMap: presignedUrlMap,
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
          <title>RestorationX - Project Files</title>
          <meta name="description" content="Project Files" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          {router.query.alert === 'roof_report_ordered' && (
            <Success title="Roof report ordered!">
              Your roof report is being generated and will available within 24
              hours
              <br />
              Your roof report .esx file will be on this page once it&apos;s
              ready
            </Success>
          )}
          {router.query.alert !== 'roof_report_ordered' &&
            pendingReports.data?.pendingRoofReports !== undefined &&
            pendingReports.data?.pendingRoofReports > 0 && (
              <Message title="Roof roof status">
                You have {pendingReports.data?.pendingRoofReports} roof
                report(s) currently processing
                <br />
                Your roof report .esx file(s) will be on this page once
                it&apos;s ready
              </Message>
            )}
          <Files accessToken={accessToken} />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default FilesPage

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
        subscriptionStatus,
        presignedUrlMap,
        projectFiles: files,
        userInfo: getUserInfo(user),
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
