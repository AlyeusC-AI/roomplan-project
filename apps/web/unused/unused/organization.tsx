import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import Organization from '@components/Settings/Organization'
import { Invitation, Member } from '@components/Settings/Organization/types'
import getInvitations from '@servicegeek/db/queries/invitations/getInvitations'
import getMembers from '@servicegeek/db/queries/organization/getMembers'
import getOrganization from '@servicegeek/db/queries/organization/getOrganization'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getOrgInfo from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { AccessLevel, SubscriptionStatus } from '@servicegeek/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'

interface OrganizationPageProps {
  error?: string
  orgId?: string | null
  orgInfo: OrgInfo
  teamMembers?: Member[]
  invitations?: Invitation[]
  isAdmin?: boolean
  userInfo: UserInfo
  subscriptionStatus: SubscriptionStatus
}

const OrganizationPage: NextPage<OrganizationPageProps> = ({
  teamMembers,
  orgInfo,
  invitations,
  userInfo,
  subscriptionStatus,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({ userInfo, teamMembers, orgInfo })}
    >
      <AppContainer
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectsNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Organization Settings</title>
          <meta
            name="description"
            content="Access organization settings and manage your team"
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Organization invitations={invitations || []} />
      </AppContainer>
    </RecoilRoot>
  )
}

export default OrganizationPage

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

    const orgPublicId = user.org?.organization.publicId

    if (!orgPublicId) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const organization = await getOrganization(orgPublicId)
    if (!organization) {
      return {
        props: {
          error: 'Could not find Organization.',
        },
      }
    }

    const allowedAccess =
      user.org?.isAdmin ||
      user.org?.accessLevel === AccessLevel.admin ||
      user.org?.accessLevel === AccessLevel.accountManager

    if (!allowedAccess) {
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const members = (await getMembers(organization.id)) as unknown as Member[]
    const serializedMembers = superjson.serialize(members)
    const invitations = await getInvitations(organization.id)

    const subscriptionStatus = await getSubcriptionStatus(user.id)

    return {
      props: {
        orgId: orgPublicId,
        teamMembers: serializedMembers.json as unknown as Member[],
        orgName: organization.name,
        orgInfo: getOrgInfo(user),
        userInfo: getUserInfo(user),
        invitations,
        isAdmin: orgAccessLevel === ORG_ACCESS_LEVEL.ADMIN,
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
