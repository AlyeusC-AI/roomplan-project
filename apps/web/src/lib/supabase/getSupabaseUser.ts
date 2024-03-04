import getUser from '@restorationx/db/queries/user/getUser'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next'

const getSupabaseUser = async (ctx: GetServerSidePropsContext) => {
  const supabaseClient = createServerSupabaseClient({
    req: ctx.req as NextApiRequest,
    res: ctx.res as NextApiResponse,
  })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  if (!user) {
    return { user: null, accessToken: null }
  }
  const supabaseUser = await getUser(user.id)
  return {
    user: supabaseUser,
    accessToken: session?.access_token,
    emailConfirmedAt: user.email_confirmed_at,
  }
}

export default getSupabaseUser
