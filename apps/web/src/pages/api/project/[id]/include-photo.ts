import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import { prisma } from '@restorationx/db'

import { SubscriptionStatus } from '@restorationx/db'
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

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    res.status(500).json({ status: 'trial_expired' })
    return
  }

  const queryId = req.query.id

  if (Array.isArray(queryId) || !queryId) {
    res.status(500).json({ status: 'no query id' })
    return queryId
  }

  try {
    const { includeInReport, inferencePublicId } = JSON.parse(req.body)
    const project = await prisma.project.findFirst({
      where: {
        publicId: queryId,
      },
    })
    if (!project) {
      res.status(500).json({ status: 'failed' })
      return
    }
    const image = await prisma.image.findFirst({
      where: {
        projectId: project.id,
        inference: {
          publicId: inferencePublicId,
        },
      },
    })
    if (!image) {
      res.status(500).json({ status: 'failed' })
      return
    }
    await prisma.image.update({
      where: {
        id: image.id,
      },
      data: {
        includeInReport,
      },
    })
    res.status(200).json({ status: 'success' })
    return
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
