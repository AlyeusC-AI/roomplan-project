import createInvitation from '@servicegeek/db/queries/organization/createInvitation'
import updateOrganizationName from '@servicegeek/db/queries/organization/updateOrganizationName'
import createOrg from '@servicegeek/db/queries/user/createOrg'
import { supabaseServiceRole } from '@lib/supabase/supabaseServiceRoleClient'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabaseClient = await createClient()

  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
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
      await supabaseServiceRole.auth.admin.inviteUserByEmail(
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
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

export async function PATCH(req: NextRequest) {
  const supabaseClient = await createClient()
  const {
    data: { user },
  } = await supabaseClient.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  const body = await req.json()
  try {
    const { orgName, orgAddress } = body
    await updateOrganizationName(user.id, orgName, orgAddress)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}