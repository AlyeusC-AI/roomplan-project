import getSubcriptionStatus from '@restorationx/db/queries/organization/getSubscriptionStatus'
import deleteFileFromProject from '@lib/supabase/deleteFileFromProject'
import { SubscriptionStatus } from '@restorationx/db'
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

  const body = JSON.parse(req.body)

  try {
    const data = await deleteFileFromProject(user.id, queryId, body.filename)
    if (data) {
      res.status(200).json({ status: 'ok' })
      return
    }
    res.status(500).json({ status: 'failed' })
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
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
