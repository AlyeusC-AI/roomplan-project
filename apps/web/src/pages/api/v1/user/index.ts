import { prisma } from '@servicegeek/db'

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

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
    res.status(500).json({ status: 'failed' })
    return
  }
  try {
    try {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          isDeleted: true,
        },
      })
      res.status(200).json({ status: 'ok' })
      return
    } catch (error) {
      console.error('Could not create support user', error)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ status: 'failed' })
    return
  }
  res.status(200).json({ status: 'ok' })
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'DELETE') await handleDelete(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
