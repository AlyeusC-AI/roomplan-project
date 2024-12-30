import { createClient } from '@lib/supabase/server'
import createRoomNote from '@servicegeek/db/queries/room/notes/createRoomNote'
import deleteRoomNote from '@servicegeek/db/queries/room/notes/deleteRoomNote'
import updateRoomNote from '@servicegeek/db/queries/room/notes/updateRoomNote'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = req.headers
  const jwt = headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }

  const queryId = (await params).id

  if (!queryId || Array.isArray(queryId)) {
    return NextResponse.json({ status: 'missing query id' }, { status: 400 })
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const body = await req.json()

  try {
    if (!body.body) {
      return NextResponse.json({ status: 'failed' }, { status: 400 })
    }
    const result = await updateRoomNote(
      user.id,
      queryId,
      body.roomId,
      body.noteId,
      body.body
    )
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = req.headers
  const jwt = headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }

  const queryId = (await params).id

  if (!queryId || Array.isArray(queryId)) {
    return NextResponse.json({ status: 'missing query id' }, { status: 400 })
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const body = await req.json()
  const roomId = (req.nextUrl.searchParams.get('roomId') || '') as string

  try {
    const result = await createRoomNote(user.id, queryId, roomId, body.body)
    console.log('room created', result)
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = req.headers
  const jwt = headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }

  const id = (await params).id
  if (!id || Array.isArray(id)) {
    return NextResponse.json({ status: 'missing query id' }, { status: 400 })
  }
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const body = await req.json()

  try {
    const result = await deleteRoomNote(user.id, id, body.roomId, body.noteId)
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}