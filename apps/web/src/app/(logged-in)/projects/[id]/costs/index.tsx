import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import Costs from '@components/Project/Costs'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import { prisma } from '@servicegeek/db'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import { getRoomList } from '@servicegeek/db/queries/project/getProjectDetections'

import { CostDataType } from '@atoms/costs'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getProjectInfo, {
  ProjectInfo,
} from '@lib/serverSidePropsUtils/getProjectInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { AccessLevel, CostType, SubscriptionStatus } from '@servicegeek/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import { User } from '@supabase/supabase-js'

interface EstimatePageProps {
  user: User
  userInfo: UserInfo
  projectInfo: ProjectInfo
  subscriptionStatus: SubscriptionStatus
  orgInfo: OrgInfo
  subcontractorCosts: CostDataType[]
  miscellaneousCosts: CostDataType[]
  materialsCosts: CostDataType[]
  laborCosts: CostDataType[]
  rcvValue: number
  actualValue: number
}

const tabs = (id: string) => [
  { name: 'Expenses', href: `/projects/${id}/costs` },
]
const PhotoPage: NextPage<EstimatePageProps> = ({
  userInfo,
  projectInfo,
  subscriptionStatus,
  orgInfo,
  subcontractorCosts,
  miscellaneousCosts,
  materialsCosts,
  laborCosts,
  rcvValue,
  actualValue,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        projectInfo,
        subcontractorCosts,
        miscellaneousCosts,
        materialsCosts,
        laborCosts,
        subscriptionStatus,
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
          <Costs rcvValue={rcvValue} actualValue={actualValue} />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default PhotoPage

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

    if (
      user.org?.accessLevel !== AccessLevel.projectManager &&
      user.org?.accessLevel !== AccessLevel.admin &&
      user.org?.accessLevel !== AccessLevel.accountManager
    ) {
      return {
        redirect: {
          destination: '/projects',
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
    let project = await prisma.project.findFirst({
      where: { publicId: ctx.query.id, organizationId: orgId },
      include: {
        costs: {
          select: {
            id: true,
            name: true,
            actualCost: true,
            estimatedCost: true,
            type: true,
          },
          where: {
            isDeleted: false,
          },
        },
      },
    })
    if (!project) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const [subscriptionStatus] = await Promise.all([
      getSubcriptionStatus(user.id),
      getRoomList(ctx.query.id, orgId),
    ])

    return {
      props: {
        userInfo: getUserInfo(user),
        projectInfo: getProjectInfo(project),
        rcvValue: project.rcvValue,
        actualValue: project.actualValue,
        subcontractorCosts: project.costs.filter(
          (cost) => cost.type === CostType.subcontractor
        ),
        miscellaneousCosts: project.costs.filter(
          (cost) => cost.type === CostType.miscellaneous
        ),
        materialsCosts: project.costs.filter(
          (cost) => cost.type === CostType.materials
        ),
        laborCosts: project.costs.filter(
          (cost) => cost.type === CostType.labor
        ),
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
