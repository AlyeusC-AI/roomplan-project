import createInvitation from '@servicegeek/db/queries/organization/createInvitation'
import updateOrganizationName from '@servicegeek/db/queries/organization/updateOrganizationName'
import createOrg from '@servicegeek/db/queries/user/createOrg'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { NextApiRequest, NextApiResponse } from 'next'

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({ req, res })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const body = JSON.parse(req.body)
  try {
    const org = await createOrg(user.id, body.orgName, body.orgSize, body.role)
    try {
      const supportUser = `support+${org.org?.organization.publicId}@servicegeek.app`
      const invitation = await createInvitation(user.id, supportUser)
      const result = await supabaseServiceRole.auth.admin.inviteUserByEmail(
        supportUser,
        {
          data: {
            orgId: invitation.orgId,
            inviteId: invitation.inviteId,
            isSupportUser: true,
            firstName: 'ServiceGeek',
            lastName: 'Support',
          },
        }
      )
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

const handlePatch = async (req: NextApiRequest, res: NextApiResponse) => {
  const supabaseClient = createServerSupabaseClient({ req, res })
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    res.status(500).json({ status: 'failed' })
    return
  }
  const body = JSON.parse(req.body)
  try {
    const { orgName, orgAddress } = body
    await updateOrganizationName(user.id, orgName, orgAddress)
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
  if (req.method === 'POST') await handlePost(req, res)
  else if (req.method === 'PATCH') await handlePatch(req, res)
  else res.status(405).json({ Error: `Operation ${req.method} not allowed` })
  return
}
