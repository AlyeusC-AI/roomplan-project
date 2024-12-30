import { createClient } from '@lib/supabase/server'
import createRoomReading from '@servicegeek/db/queries/room/reading/createRoomReading'
import deleteRoomReading from '@servicegeek/db/queries/room/reading/deleteRoomReading'
import getRoomReadings from '@servicegeek/db/queries/room/reading/getRoomReadings'
import updateRoomReading from '@servicegeek/db/queries/room/reading/updateRoomReading'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = req.headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
  const userId = req.nextUrl.searchParams.get('userId')
  const projectId = (await params).id

  try {
    const readings = await getRoomReadings(userId!, projectId)
    // @ts-expect-error
    if (readings.failed) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', roomReadings: readings })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const jwt = req.headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
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
  console.log('body', body)
  try {
    if (!body.readingData) {
      return NextResponse.json({ status: 'failed' }, { status: 400 })
    }
    const result = await updateRoomReading(
      body.userId,
      body.projectId,
      body.roomId,
      body.readingId,
      JSON.parse(body.readingData)
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
  const jwt = req.headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser(jwt)
  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json({ status: 'failed' }, { status: 400 })
  }
  const userId = req.nextUrl.searchParams.get('userId')
  const projectId = req?.nextUrl?.searchParams.get('projectId')
  const roomId = req?.nextUrl?.searchParams.get('roomId')

  try {
    const result = await createRoomReading(
      userId!,
      projectId!,
      roomId!,
      undefined
    )
    // @ts-expect-error
    if (result?.failed) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', result }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = req.headers.get('auth-token')
  if (!jwt || Array.isArray(jwt)) {
    return NextResponse.json({ status: 'Missing token' }, { status: 500 })
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
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json({ status: 'failed' }, { status: 400 })
  }
  const userId = req.nextUrl.searchParams.get('userId')
  const projectId = req?.nextUrl?.searchParams.get('projectId')
  const roomId = body?.roomId
  const readingId = body?.readingId

  try {
    const result = await deleteRoomReading(userId!, projectId!, roomId, readingId)
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