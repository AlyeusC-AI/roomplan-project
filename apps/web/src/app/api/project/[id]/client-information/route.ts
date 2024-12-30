import { createClient } from '@lib/supabase/server'
import updateClientInformation from '@servicegeek/db/queries/organization/updateClientInformation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!user || !session?.access_token) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  const body = await req.json()
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json({ status: 'failed', reason: 'invalid query param' }, { status: 400 })
  }

  try {
    await updateClientInformation(
      user.id,
      id,
      body.clientName,
      body.clientPhoneNumber,
      body.clientEmail,
      body.location,
      body.claimSummary,
      body.assignmentNumber
    )

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}