import { createClient } from '@lib/supabase/server'
import setTemplateAsUsed from '@servicegeek/db/queries/room/setTemplateAsUsed'
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
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }

  const body = await req.json()
  const { roomId, templateCode, excludedItems } = body

  if (Array.isArray(roomId) || !roomId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param roomId' },
      { status: 400 }
    )
  }

  if (Array.isArray(templateCode) || !templateCode) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param templateCode' },
      { status: 400 }
    )
  }

  try {
    const result = await setTemplateAsUsed(
      user.id,
      id,
      roomId,
      templateCode,
      excludedItems
    )
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json(
      {
        status: 'ok',
        inferenceId: result.inferenceId,
        detections: result.detections,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
