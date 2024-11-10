import deleteProject from '@servicegeek/db/queries/project/deleteProject'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const { failed, reason } = await deleteProject(user.id, projectId)
    if (failed) {
      res.status(500).json({ status: 'failed', reason })
      return
    }
    res.status(200).json({ status: 'ok' })
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
  if (req.method === 'DELETE') await handleDelete(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
