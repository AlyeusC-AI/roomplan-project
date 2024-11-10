import updateRoomForInference from '@servicegeek/db/queries/inference/updateRoomForInference'
import createRoom from '@servicegeek/db/queries/room/createRoom'
import deleteRoom from '@servicegeek/db/queries/room/deleteRoom'
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
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const room = await createRoom(user.id, id, body.room)
    // @ts-expect-error

    if (room.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }
    // @ts-expect-error
    res.status(200).json({ status: 'ok', publicId: room.publicId })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
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
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const keys = body.imageKeys as string[]
    for (const key of keys) {
      const result = await updateRoomForInference(key, body.roomId, user.id)
      if (result?.failed) {
        console.log(result)
        res.status(500).json({ status: 'failed' })
        return
      }
    }
    res.status(200).json({ status: 'ok' })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

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
  const body = JSON.parse(req.body)
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const result = await deleteRoom(user.id, id, body.roomId)
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      res.status(500).json({ status: 'failed' })
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
  if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'PATCH') await handlePatch(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
