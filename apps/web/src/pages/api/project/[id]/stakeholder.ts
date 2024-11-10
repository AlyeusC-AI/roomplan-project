import assignUserToProject from '@servicegeek/db/queries/project/assignUserToProject'
import getUsersForProject from '@servicegeek/db/queries/project/getUsersForProject'
import removeUserFromToProject from '@servicegeek/db/queries/project/removeUserFromProject'
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

  try {
    const { userId } = body as { userId: string }
    const success = await assignUserToProject(user.id, id, userId)
    if (!success) {
      console.error('failed to assign')
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok' })
    return
  } catch (err: any) {
    if (err.meta?.cause) {
      if (err.meta?.cause === 'Record to delete does not exist.') {
        res.status(500).json({
          status: 'failed',
          reason: 'Could not delete from supabase',
        })
        return
      }
    }
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
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  const body = JSON.parse(req.body)

  try {
    const { userId } = body as { userId: string }
    const success = await removeUserFromToProject(user.id, id, userId)
    if (!success) {
      console.error('failed to assign')
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ status: 'ok' })
    return
  } catch (err: any) {
    if (err.meta?.cause) {
      if (err.meta?.cause === 'Record to delete does not exist.') {
        res.status(500).json({
          status: 'failed',
          reason: 'Could not delete from supabase',
        })
        return
      }
    }
    res.status(500).json({ status: 'failed' })
    return
  }
}

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
    const users = await getUsersForProject(user.id, projectId)
    if (!users) {
      res.status(500).json({ status: 'failed' })
      return
    }
    res.status(200).json({ users })
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
  if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'DELETE') await handleDelete(req, res)
  else if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
