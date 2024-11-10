import acceptInvitation from '@servicegeek/db/queries/invitations/acceptInvitation'
import updateUser from '@servicegeek/db/queries/user/updateUser'
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

  const { firstName, lastName, inviteId, phone } = body
  if (!firstName && !lastName && !phone) {
    res.status(500).json({
      status: 'failed',
      message: 'firstName and lastName and phone must be provided.',
    })
    return
  }
  try {
    console.log('phone', phone)
    await updateUser({ id: user.id, firstName, lastName, phone })
    await acceptInvitation(inviteId)
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
