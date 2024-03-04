import { prisma } from '@restorationx/db'

import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const supabaseClient = createServerSupabaseClient({
      req,
      res,
    })
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()
    if (!user) {
      console.error('Session does not exist.')
      res.status(500).json({ status: 'failed' })
      return
    }
    const categories = await prisma.itemCategory.findMany({
      where: {
        xactimateKey: {
          not: '',
        },
        hasItems: true,
      },
      select: {
        xactimateKey: true,
        xactimateDescription: true,
      },
    })
    if (!categories) {
      res
        .status(400)
        .json({ status: 'failed', reason: 'could not fetch categories' })
      return
    }
    res.status(200).json({
      status: 'ok',
      categories: categories,
    })
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
  if (req.method === 'GET') await handleGet(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
