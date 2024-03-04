import createRoomReading from '@restorationx/db/queries/room/reading/createRoomReading'
import deleteRoomReading from '@restorationx/db/queries/room/reading/deleteRoomReading'
import getRoomReadings from '@restorationx/db/queries/room/reading/getRoomReadings'
import updateRoomReading from '@restorationx/db/queries/room/reading/updateRoomReading'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).send('Session does not exist')
    return
  }
  const userId = req.query.userId
  const projectId = req?.query?.projectId

  try {
    // @ts-expect-error
    const readings = await getRoomReadings(userId, projectId)
    // @ts-expect-error
    if (readings.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok', roomReadings: readings })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).send('Session does not exist')
    return
  }

  const body = JSON.parse(req.body)
  console.log('body', body)
  try {
    if (!body.readingData) {
      res.status(500).json({ status: 'failed' })
      return
    }
    const result = await updateRoomReading(
      body.userId,
      body.projectId,
      body.roomId,
      body.readingId,
      JSON.parse(body.readingData)
    )
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

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).send('Session does not exist')
    return
  }

  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  const userId = req.query.userId
  const projectId = req?.query?.projectId
  const roomId = req?.query?.roomId

  try {
    // @ts-expect-error
    const result = await createRoomReading(userId, projectId, roomId, undefined)
    // @ts-expect-error
    if (result?.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok', result })
    return
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
}

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const headers = req.headers
  const jwt = headers['auth-token']
  if (!jwt || Array.isArray(jwt)) {
    res.status(500).json({ status: 'Missing token' })
    return
  }
  const supabase = createServerSupabaseClient({
    req,
    res,
  })

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).send('Session does not exist')
    return
  }

  const body = JSON.parse(req.body)
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  const userId = req.query.userId
  const projectId = req?.query?.projectId
  const roomId = body?.roomId
  const readingId = body?.readingId

  try {
    // @ts-expect-error
    const result = await deleteRoomReading(userId, projectId, roomId, readingId)
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
  if (req.method === 'PATCH') await handlePatch(req, res)
  else if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
