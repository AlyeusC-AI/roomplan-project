import createInvitation from '@servicegeek/db/queries/organization/createInvitation'
import createOrg from '@servicegeek/db/queries/user/createOrg'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const headers = req.headers
  const jwt = headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  const body = await req.json()
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
      console.log(result)
    } catch (error) {
      console.error('Could not create support user', error)
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
