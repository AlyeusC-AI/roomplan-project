import updateUser from '@restorationx/db/queries/user/updateUser'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { isNullOrUndefined } from '@restorationx/utils/isNullOrUndefined'
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

  const { firstName, lastName, phone } = body
  if (
    isNullOrUndefined(firstName) &&
    isNullOrUndefined(lastName) &&
    isNullOrUndefined(phone)
  ) {
    res.status(500).json({
      status: 'failed',
      message: 'firstName and lastName must be provided.',
    })
    return
  }
  try {
    await updateUser({ id: user.id, firstName, lastName, phone })
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
