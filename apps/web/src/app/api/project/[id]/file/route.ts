import getSubcriptionStatus from '@servicegeek/db/queries/organization/getSubscriptionStatus'
import deleteFileFromProject from '@lib/supabase/deleteFileFromProject'
import { SubscriptionStatus } from '@servicegeek/db'
import { createClient } from '@lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const subscriptionStatus = await getSubcriptionStatus(user.id)
  if (subscriptionStatus === SubscriptionStatus.past_due) {
    return NextResponse.json({ status: 'trial_expired' }, { status: 500 })
  }

  const queryId = (await params).id

  if (Array.isArray(queryId) || !queryId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }

  const body = await req.json()

  try {
    const data = await deleteFileFromProject(user.id, queryId, body.filename)
    if (data) {
      return NextResponse.json({ status: 'ok' }, { status: 200 })
    }
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}