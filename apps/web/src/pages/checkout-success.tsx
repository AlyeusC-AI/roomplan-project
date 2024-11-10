import AppHeader from '@components/AppHeader'
import CheckoutSuccess from '@components/CheckoutSuccess'
import PageContainer from '@components/PageContainer'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
  NextPage,
} from 'next'
import Head from 'next/head'

interface CheckoutSuccessProps {}

const CheckoutSuccessPage: NextPage<CheckoutSuccessProps> = () => {
  return (
    <PageContainer>
      <Head>
        <title>ServiceGeek - Dashboard</title>
        <meta
          name="description"
          content="Access projects that you have integrated with ServiceGeek"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppHeader />
      <CheckoutSuccess />
    </PageContainer>
  )
}

export default CheckoutSuccessPage

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createServerSupabaseClient({
    req: ctx.req as NextApiRequest,
    res: ctx.res as NextApiResponse,
  })
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      }
    }

    return { props: {} }

    // const publicOrgId = servicegeekUser.org?.organization.publicId || null
    // let projects = null
    // if (servicegeekUser.org?.organization.id) {
    //   const orgWithProjects = await listProjects(
    //     servicegeekUser.org?.organization.id
    //   )
    //   projects = superjson.serialize(orgWithProjects?.projects)
    //     .json as unknown as ProjectType[]
    // }
    // return {
    //   props: {
    //     orgId: publicOrgId,
    //     projects,
    //   },
    // }
  } catch (e) {
    console.error(e)
    return {
      props: {},
    }
  }
}
