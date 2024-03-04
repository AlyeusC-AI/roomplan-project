import { prisma } from '@restorationx/db'

import { DashboardViews } from '@restorationx/db'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

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

  const { preference } = body

  if (
    preference !== DashboardViews.listView &&
    preference !== DashboardViews.boardView
  ) {
    console.error('Invalid prference')
    res.status(500).json({ status: 'failed' })
    return
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        savedDashboardView: preference,
      },
    })
  } catch (err) {
    console.error('err', err)
    res.status(500).json({ status: 'failed' })
    return
  }
  res.status(200).json({ status: 'ok' })
  return
}

export default async function ProtectedRoute(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'PATCH') await handlePatch(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
