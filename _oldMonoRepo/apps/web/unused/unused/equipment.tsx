import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import ManageEquipment from '@components/Settings/ManageEquipment'
import { SubscriptionStatus } from '@servicegeek/db'
import { RouterOutputs } from '@servicegeek/api'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

interface EquipmentPageProps {
  intialOrganizationEquipment: RouterOutputs['equipment']['getAll']
  userInfo: UserInfo
  orgInfo: OrgInfo
  subscriptionStatus: SubscriptionStatus
}

export default async function EquipmentPage({
  userInfo,
  intialOrganizationEquipment,
  orgInfo,
  subscriptionStatus,
}: LoggedInUserInfo) {
  return (
    <RecoilRoot initializeState={initRecoilAtoms({ userInfo, orgInfo })}>
      <AppContainer
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Manage Equipment</title>
          <meta name="description" content="ServiceGeek account settings" />
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