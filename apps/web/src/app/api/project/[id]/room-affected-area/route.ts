import { createClient } from '@lib/supabase/server'
import updateOrCreateRoomAffectedArea from '@servicegeek/db/queries/room/updateOrCreateRoomAffectedArea'
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
    if (!body.affectedAreaData) {
      return NextResponse.json(
        { status: 'failed', reason: 'missing affectedAreaData' },
        { status: 400 }
      )
    }
    const result = await updateOrCreateRoomAffectedArea(
      user.id,
      id,
      body.roomId,
      body.affectedAreaData,
      body.type
    )
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
