import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import Organization from '@components/Settings/Organization'
import { Invitation, Member } from '@components/Settings/Organization/types'
import getInvitations from '@servicegeek/db/queries/invitations/getInvitations'
import getMembers from '@servicegeek/db/queries/organization/getMembers'
import getOrganization from '@servicegeek/db/queries/organization/getOrganization'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { AccessLevel, SubscriptionStatus } from '@servicegeek/db'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'
import superjson from 'superjson'
import ManageEquipment from '@components/Settings/ManageEquipment'
import { appRouter, RouterOutputs } from '@servicegeek/api'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import ManageWorkflow from '@components/Settings/Workflow'

interface WorkflowPageProps {
  error?: string
  orgId?: string | null
  orgInfo: OrgInfo
  teamMembers?: Member[]
  statuses: RouterOutputs['projectStatus']['getAllProjectStatuses']['statuses']
  isAdmin?: boolean
  userInfo: UserInfo
  subscriptionStatus: SubscriptionStatus
}

const WorkflowPage: NextPage<WorkflowPageProps> = ({
  teamMembers,
  orgInfo,
  statuses,
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
          <title>ServiceGeek - Workflow Settings</title>
          <meta name="description" content="Manage your project statuses" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ManageWorkflow statuses={statuses} />
      </AppContainer>
    </RecoilRoot>
  )
}

export default WorkflowPage

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

    const supabaseClient = createServerSupabaseClient({
      req: ctx.req as NextApiRequest,
      res: ctx.res as NextApiResponse,
    })
    const {
      data: { user: sUser },
    } = await supabaseClient.auth.getUser()
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()
    if (!user) {
      return { user: null, accessToken: null }
    }

    const statusCaller = appRouter.projectStatus.createCaller({
      user: sUser,
      session,
      supabase: supabaseClient,
    })
    const { statuses } = await statusCaller.getAllProjectStatuses({})

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
        statuses,
      },
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
