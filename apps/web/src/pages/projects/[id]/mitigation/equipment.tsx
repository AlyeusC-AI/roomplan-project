import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import ProjectEquipment from '@components/Project/Equipment'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import getAllOrganizationEquipment from '@restorationx/db/queries/equipment/getAllOrganizationEquipment'
import getallProjectEquipment from '@restorationx/db/queries/equipment/getAllProjectEquipment'
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
import { SubscriptionStatus } from '@restorationx/db'
import { RouterOutputs } from '@restorationx/api'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

interface EquipmentPageProps {
  subscriptionStatus: SubscriptionStatus
  initialUsedEquipment: RouterOutputs['equipment']['getAllUsed']
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
  userInfo: UserInfo
  orgInfo: OrgInfo
  projectInfo: ProjectInfo
}

const tabs = (id: string) => [
  { name: 'Readings', href: `/projects/${id}/mitigation` },
  { name: 'Notes', href: `/projects/${id}/mitigation/notes` },
  { name: 'Scope', href: `/projects/${id}/mitigation/scope` },
  { name: 'Equipment', href: `/projects/${id}/mitigation/equipment` },
]

const EquipmentPage: NextPage<EquipmentPageProps> = ({
  subscriptionStatus,
  initialUsedEquipment,
  intialOrganizationEquipment,
  userInfo,
  orgInfo,
  projectInfo,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({ userInfo, orgInfo, projectInfo })}
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
          <ProjectEquipment
            initialUsedEquipment={initialUsedEquipment}
            intialOrganizationEquipment={intialOrganizationEquipment}
          />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default EquipmentPage

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

    const subscriptionStatus = await getSubcriptionStatus(user.id)
    const initialUsedEquipment = await getallProjectEquipment(project.id)
    const intialOrganizationEquipment = await getAllOrganizationEquipment(orgId)
    return {
      props: {
        initialUsedEquipment,
        intialOrganizationEquipment,
        subscriptionStatus,
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
