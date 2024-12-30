import { fetchLoggedInUserAndOrg } from '@lib/server-side-fetching/fetch/fetch-logged-in-user'
import { createClient } from '@lib/supabase/server'
import updateUser from '@servicegeek/db/queries/user/updateUser'
import { isNullOrUndefined } from '@servicegeek/utils/isNullOrUndefined'
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

  const { firstName, lastName, phone } = await req.json()
  if (
    isNullOrUndefined(firstName) &&
    isNullOrUndefined(lastName) &&
    isNullOrUndefined(phone)
  ) {
    return NextResponse.json(
      { status: 'failed', message: 'firstName and lastName must be provided.' },
      { status: 500 }
    )
  }
  try {
    await updateUser({ id: user.id, firstName, lastName, phone })
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

export async function GET() {
  try {
    const user = await fetchLoggedInUserAndOrg()
    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('error', error)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
