import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabase = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  try {
    const { data, error } = await supabaseServiceRole.storage
      .from('profile-pictures')
      .createSignedUrl(`${user.id}/avatar.png`, 3600)
    if (error || !data) {
      res.status(200).json({ status: 'failed', url: null })
      return
    }
    res.status(200).json({
      status: 'ok',
      url: data?.signedUrl,
    })
    return
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
