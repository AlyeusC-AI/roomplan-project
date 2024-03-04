import Camera from '@components/Project/Camera'
import getProjectForOrg from '@restorationx/db/queries/project/getProjectForOrg'
import { UserInfo } from '@lib/serverSidePropsUtils/getUserInfo'
import getUserWithAuthStatus, {
  ORG_ACCESS_LEVEL,
} from '@lib/serverSidePropsUtils/getUserWithAuthStatus'
import { SubscriptionStatus } from '@restorationx/db'
import { User } from '@supabase/auth-helpers-nextjs'
import type { GetServerSidePropsContext, NextPage } from 'next'
import Head from 'next/head'

interface EstimatePageProps {
  user: User
  userInfo: UserInfo
  accessToken: string
  error?: string
  subscriptionStatus: SubscriptionStatus
}

const EstimateDetailsPage: NextPage<EstimatePageProps> = () => {
  return (
    <>
      <Head>
        <title>RestorationX - Upload Images</title>
        <meta name="description" content="Project Estimate and Details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Camera />
    </>
  )
}

export default EstimateDetailsPage

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
    return {
      props: {},
    }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
