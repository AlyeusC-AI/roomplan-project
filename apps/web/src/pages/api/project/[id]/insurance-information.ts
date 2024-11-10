import updateInsuranceInformation from '@servicegeek/db/queries/organization/updateInsuranceInformation'
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
  const body = JSON.parse(req.body)
  const id = req.query.id
  if (Array.isArray(id) || !id) {
    res.status(400).json({ status: 'failed', reason: 'invalid query param' })
    return
  }
  try {
    await updateInsuranceInformation(
      user.id,
      id,
      body.insuranceCompanyName,
      body.adjusterName,
      body.adjusterPhoneNumber,
      body.adjusterEmail,
      body.insuranceClaimId,
      body.lossType,
      body.catCode
    )
    res.status(200).json({ status: 'ok' })
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
