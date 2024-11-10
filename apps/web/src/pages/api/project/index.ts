import createProject from '@servicegeek/db/queries/project/createProject'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
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
  const body = JSON.parse(req.body)

  try {
    const { publicId, failed, reason } = await createProject(user.id, {
      name: body.name,
      location: body.location,
    })
    if (failed) {
      res.status(500).json({ status: 'failed', reason })
      return
    }
    res.status(200).json({ status: 'ok', projectId: publicId })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
