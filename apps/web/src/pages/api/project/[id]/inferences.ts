import { getInferenceList } from '@servicegeek/db/queries/project/getProjectDetections'
import getUser from '@servicegeek/db/queries/user/getUser'
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

  const projectId = req.query.id
  if (Array.isArray(projectId) || !projectId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const servicegeekUser = await getUser(user.id)
    const organizationId = servicegeekUser?.org?.organization.id
    if (!organizationId) {
      res.status(500).json({ status: 'failed' })
      return
    }
    const inferenceList = await getInferenceList(projectId, organizationId)
    const inferences = inferenceList?.rooms || []
    res.status(200).json({
      status: 'ok',
      inferences,
    })
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
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
