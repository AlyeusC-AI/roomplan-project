import AppContainer from '@components/layouts/AppContainer'
import ProjectsNavigationContainer from '@components/Projects/ProjectsNavigationContainer'
import Billing from '@components/Settings/Billing'
import getOrganization from '@servicegeek/db/queries/organization/getOrganization'
import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import getPrice from '@servicegeek/db/queries/prices/getPrice'
import getProduct from '@servicegeek/db/queries/products/getProduct'
import getSubscriptions from '@servicegeek/db/queries/subscriptions/getSubscriptions'
import getOrgInfo, { OrgInfo } from '@lib/serverSidePropsUtils/getOrgInfo'
import getUserInfo, { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@servicegeek/db'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'
import { RecoilRoot } from 'recoil'
import initRecoilAtoms from '@atoms/initRecoilAtoms'

interface BillingPageProps {
  status: string
  planInfo?: {
    unitAmount: string
    currency: string
    type: string
    interval: string
  }
  productInfo?: {
    name: string
  }
  userInfo: UserInfo
  orgInfo: OrgInfo
  subscriptionStatus: SubscriptionStatus
}

const BillingPage: NextPage<BillingPageProps> = ({
  status,
  planInfo,
  productInfo,
  userInfo,
  orgInfo,
  subscriptionStatus,
}) => {
  return (
    <RecoilRoot
      initializeState={initRecoilAtoms({
        userInfo,
        orgInfo,
        subscriptionStatus,
      })}
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

        <Billing
          status={status}
          planInfo={planInfo}
          productInfo={productInfo}
        />
      </AppContainer>
    </RecoilRoot>
  )
}

export default BillingPage

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
      console.error('Access Revoked')
      return {
        redirect: {
          destination: '/access-revoked',
          permanent: false,
        },
      }
    }
    const orgPublicId = user.org?.organization.publicId

    if (!orgPublicId) {
      console.error('No Org ID')
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }
    const organization = await getOrganization(orgPublicId)
    if (!organization) {
      console.error('No Org')
      return {
        props: {
          error: 'Could not find Organization.',
        },
      }
    }

    const subscriptions = await getSubscriptions(organization.id)
    const subscription = subscriptions[0]
    if (orgAccessLevel !== ORG_ACCESS_LEVEL.ADMIN) {
      console.error('Invalid org access level', orgAccessLevel)
      return {
        redirect: {
          destination: '/projects',
          permanent: false,
        },
      }
    }

    let planInfo
    let productInfo

    if (subscription) {
      const price = await getPrice(subscription.pricesId)
      if (price) {
        const { unitAmount, currency, type, interval } = price
        planInfo = {
          unitAmount: `${unitAmount}`,
          currency,
          type,
          interval,
        }

        const product = await getProduct(price.productId)

        if (product) {
          productInfo = {
            name: product.name,
          }
        }
      }
    }

    const subscriptionStatus = await getSubcriptionStatus(user.id)

    return {
      props: {
        status: !subscription ? 'never' : subscription.status,
        planInfo: planInfo || null,
        productInfo: productInfo || null,
        userInfo: getUserInfo(user),
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
