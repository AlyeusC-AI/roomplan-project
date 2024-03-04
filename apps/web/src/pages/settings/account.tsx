import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import Account from '@components/Settings/Account'
import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@restorationx/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

interface AccountPageProps {
  error?: string
  isAdmin?: boolean
  emailConfirmed: boolean
  userInfo: UserInfo
  orgInfo: OrgInfo
  subscriptionStatus: SubscriptionStatus
}

const AccountPage: NextPage<AccountPageProps> = ({
  isAdmin = false,
  emailConfirmed = false,
  userInfo,
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
          <title>RestorationX - Account Settings</title>
          <meta name="description" content="RestorationX account settings" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Account isAdmin={isAdmin} emailConfirmed={emailConfirmed} />
      </AppContainer>
    </RecoilRoot>
  )
}

export default AccountPage

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
    const subscriptionStatus = await getSubcriptionStatus(user.id)

    return {
      props: {
        isAdmin: orgAccessLevel === ORG_ACCESS_LEVEL.ADMIN,
        emailConfirmed,
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
