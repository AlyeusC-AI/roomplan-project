import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import ManageEquipment from '@components/Settings/ManageEquipment'
import getAllOrganizationEquipment from '@restorationx/db/queries/equipment/getAllOrganizationEquipment'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
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
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
  userInfo: UserInfo
  orgInfo: OrgInfo
  subscriptionStatus: SubscriptionStatus
}

const EquipmentPage: NextPage<EquipmentPageProps> = ({
  userInfo,
  intialOrganizationEquipment,
  orgInfo,
  subscriptionStatus,
}) => {
  return (
    <RecoilRoot initializeState={initRecoilAtoms({ userInfo, orgInfo })}>
      <AppContainer
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
      >
        <Head>
          <title>RestorationX - Manage Equipment</title>
          <meta name="description" content="RestorationX account settings" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ManageEquipment
          intialOrganizationEquipment={intialOrganizationEquipment}
        />
      </AppContainer>
    </RecoilRoot>
  )
}

export default EquipmentPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  try {
    const { user, orgAccessLevel, emailConfirmed } =
      await getUserWithAuthStatus(ctx)

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
    if (!orgId) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    const intialOrganizationEquipment = await getAllOrganizationEquipment(orgId)
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    return {
      props: {
        intialOrganizationEquipment,
        userInfo: getUserInfo(user),
        orgInfo: getOrgInfo(user),
        subscriptionStatus,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {
        emailConfirmed: false,
      },
    }
  }
}
