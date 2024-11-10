import getTemplates from '@servicegeek/db/queries/room/getTemplates'
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
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  const roomId = req.query.roomId
  if (Array.isArray(roomId) || !roomId) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  const fetchAll = req.query.fetchAll
  if (Array.isArray(fetchAll)) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const templates = await getTemplates(user.id, id, roomId, !!fetchAll)
    // @ts-expect-error
    if (templates.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }

    res.status(200).json({
      status: 'ok',
      templates,
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
