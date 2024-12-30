import { createClient } from '@lib/supabase/server'
import updateRoomDimensionData from '@servicegeek/db/queries/room/updateRoomDimension'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
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
    if (!body.roomDimensionData) {
      return NextResponse.json(
        { status: 'failed', reason: 'missing roomDimensionData' },
        { status: 400 }
      )
    }
    const result = await updateRoomDimensionData(
      user.id,
      id,
      body.roomId,
      body.roomDimensionData
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
