import deleteImagesFromProject from '@servicegeek/db/queries/project/deleteImagesFromProject'
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
  const body = JSON.parse(req.body)
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }

  try {
    const { keys } = body as { keys: string[] }
    if (!keys) {
      res.status(500).json({ status: 'failed', reason: 'keys required' })
      return
    }
    const { failed, reason } = await deleteImagesFromProject(user.id, id, keys)

    if (failed) {
      res.status(500).json({ status: 'failed', reason })
      return
    }
    res.status(200).json({ status: 'ok' })
    return
  } catch (err: any) {
    if (err.meta?.cause) {
      if (err.meta?.cause === 'Record to delete does not exist.') {
        res.status(500).json({
          status: 'failed',
          reason: 'Could not delete images',
        })
      }
    }
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
