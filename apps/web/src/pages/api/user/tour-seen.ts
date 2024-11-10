import { prisma } from '@servicegeek/db'

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

  console.log('body', body)
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        productTourData: body,
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
