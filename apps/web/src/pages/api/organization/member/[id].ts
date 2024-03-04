import removeMember from '@restorationx/db/queries/organization/removeMember'
import updateAccessLevel from '@restorationx/db/queries/organization/updateAccessLevel'
import { AccessLevel } from '@restorationx/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleDelete = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({
    req,
    res,
  })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()
  if (!user || !session?.access_token) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const result = await removeMember(user.id, id)
    if (result.failed) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({
      status: 'ok',
    })
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
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!user || !session?.access_token) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const body = JSON.parse(req.body) as { accessLevel: AccessLevel }
    const { accessLevel } = body
    if (!accessLevel) {
      res.status(500).json({ status: 'failed - invalid access level' })
      return
    }
    const result = await updateAccessLevel(user.id, id, accessLevel)
    if (!result) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({
      status: 'ok',
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
  if (req.method === 'DELETE') await handleDelete(req, res)
  else if (req.method === 'PATCH') await handlePatch(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
