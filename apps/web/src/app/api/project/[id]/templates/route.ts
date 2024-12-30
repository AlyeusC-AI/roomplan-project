import { createClient } from '@lib/supabase/server'
import getTemplates from '@servicegeek/db/queries/room/getTemplates'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
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
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }

  const roomId = req.nextUrl.searchParams.get('roomId')
  if (Array.isArray(roomId) || !roomId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param roomId' },
      { status: 400 }
    )
  }

  const fetchAll = req.nextUrl.searchParams.get('fetchAll')
  if (Array.isArray(fetchAll)) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param fetchAll' },
      { status: 400 }
    )
  }

  try {
    const templates = await getTemplates(user.id, id, roomId, !!fetchAll)
    // @ts-expect-error
    if (templates?.failed) {
      console.log(templates)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok', templates }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
