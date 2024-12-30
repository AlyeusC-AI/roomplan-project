import { createClient } from '@lib/supabase/server'
import updateInsuranceInformation from '@servicegeek/db/queries/organization/updateInsuranceInformation'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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
  const body = await req.json()
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
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

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
