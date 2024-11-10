import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import Report from '@components/Project/Report'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import {
  RoomData,
  RoomDataWithoutInferences,
} from '@servicegeek/db/queries/project/getProjectDetections'
import getReportData from '@lib/pages/getReportData'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getPresignedUrlMapFromInferenceList from '@lib/supabase/getPresignedUrlMapFromInferenceList'
import { SubscriptionStatus } from '@servicegeek/db'
import { User } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import Script from 'next/script'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import { ProjectReportData } from '@atoms/projectReportDataState'
import superjson from 'superjson'

import { PresignedUrlMap } from '../photos'

export interface uploadInProgressImages {
  path: string
  name: string
}

interface ReportPageProps {
  user: User
  userInfo: UserInfo
  accessToken: string
  error?: string
  inferences?: RoomData[]
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  rooms: RoomDataWithoutInferences[]
  projectReportData: ProjectReportData
  urlMap: PresignedUrlMap
}

const tabs = (id: string) => [
  { name: 'Report', href: `/projects/${id}/report` },
]

const ReportPage: NextPage<ReportPageProps> = ({
  userInfo,
  projectInfo,
  subscriptionStatus,
  orgInfo,
  rooms,
  projectReportData,
  urlMap,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        projectInfo,
        rooms,
        projectReportData,
        urlMap,
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
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
          integrity="sha512-GsLlZN/3F2ErC5ifS5QtgpiJtWd43JWSuIgh7mbzZ8zBps+dvLusV+eNQATqgA/HdeKFVgA5v3S/cIrLF7QnIg=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Report />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default ReportPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    if (!ctx.query.id || Array.isArray(ctx.query.id)) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const { user } = await getReportData(ctx, ctx.query.id)
    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }
    const project = user?.org?.organization.projects[0]
    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    const urlMap = !project
      ? {}
      : // @ts-expect-error it's ok
        await getPresignedUrlMapFromInferenceList(project)

    return {
      props: {
        projectReportData: superjson.serialize(project).json,
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
        urlMap,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
