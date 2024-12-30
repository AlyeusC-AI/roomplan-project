import TrailEndedBanner from '@components/Banners/TrailEndedBanner'
import AppContainer from '@components/layouts/AppContainer'
import MainContent from '@components/layouts/MainContent'
import TabNavigation from '@components/layouts/TabNavigation'
import Import from '@components/Project/Import'
import ProjectNavigationContainer from '@components/Project/ProjectNavigationContainer'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getProjectForOrg from '@servicegeek/db/queries/project/getProjectForOrg'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

interface ImportPageProps {
  subscriptionStatus: SubscriptionStatus
}

const tabs = (id: string) => [
  { name: 'Import', href: `/projects/${id}/import` },
]

const ImportPage: NextPage<ImportPageProps> = ({ subscriptionStatus }) => {
  return (
    <RecoilRoot initializeState={initRecoilAtoms({})}>
      <AppContainer
        hideParentNav
        subscriptionStatus={subscriptionStatus}
        renderSecondaryNavigation={() => <ProjectNavigationContainer />}
      >
        <Head>
          <title>ServiceGeek - Import</title>
          <meta name="description" content="Import an xactimate estimate" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        {subscriptionStatus === SubscriptionStatus.past_due && (
          <TrailEndedBanner />
        )}
        <TabNavigation tabs={tabs} />
        <MainContent>
          <Import />
        </MainContent>
      </AppContainer>
    </RecoilRoot>
  )
}

export default ImportPage

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

    return {
      props: {
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
