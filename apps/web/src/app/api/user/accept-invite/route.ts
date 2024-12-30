import { createClient } from '@lib/supabase/server'
import acceptInvitation from '@servicegeek/db/queries/invitations/acceptInvitation'
import updateUser from '@servicegeek/db/queries/user/updateUser'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const { firstName, lastName, inviteId, phone } = await req.json()

  if (!firstName && !lastName && !phone) {
    return NextResponse.json({
      status: 'failed',
      message: 'firstName and lastName and phone must be provided.',
    }, { status: 500 })
    return
  }
  try {
    console.log('phone', phone)
    await updateUser({ id: user.id, firstName, lastName, phone })
    await acceptInvitation(inviteId)
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}
