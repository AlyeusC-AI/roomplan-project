import { useEffect } from 'react'
import { Footer } from '@components/LandingPage/Footer'
import { Header } from '@components/LandingPage/Header'
import WaitList from '@components/WaitList'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { useUser } from '@supabase/auth-helpers-react'
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function WaitListPage() {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/projects')
  }, [user, router])

  return (
    <>
      <Head>
        <title>ServiceGeek - Wait List</title>
        <meta
          name="description"
          content="A job management platform built for restoration"
        />
      </Head>
      <Header />
      <main>
        <WaitList />
      </main>
      <Footer />
    </>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  let isLoggedIn = false
  try {
    const supabase = createServerSupabaseClient({
      req: ctx.req as NextApiRequest,
      res: ctx.res as NextApiResponse,
    })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch (e) {}

  if (isLoggedIn) {
    return {
      redirect: {
        destination: '/projects',
        permanent: false,
      },
    }
  }
  return {
    props: {}, // will be passed to the page component as props
  }
}
