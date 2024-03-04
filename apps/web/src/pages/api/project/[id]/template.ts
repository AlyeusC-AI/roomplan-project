import setTemplateAsUsed from '@restorationx/db/queries/room/setTemplateAsUsed'
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
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  const body = JSON.parse(req.body)
  const { roomId, templateCode, excludedItems } = body

  if (Array.isArray(roomId) || !roomId) {
    res
      .status(400)
      .json({ status: 'failed', reason: 'invalid query param roomId' })
    return
  }

  if (Array.isArray(templateCode) || !templateCode) {
    res
      .status(400)
      .json({ status: 'failed', reason: 'invalid query param templateCode' })
    return
  }

  try {
    const result = await setTemplateAsUsed(
      user.id,
      id,
      roomId,
      templateCode,
      excludedItems
    )
    if (result.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }

    res.status(200).json({
      status: 'ok',
      inferenceId: result.inferenceId,
      detections: result.detections,
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
  if (req.method === 'POST') await handlePost(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
