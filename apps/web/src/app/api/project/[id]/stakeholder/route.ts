import { createClient } from '@lib/supabase/server'
import assignUserToProject from '@servicegeek/db/queries/project/assignUserToProject'
import getUsersForProject from '@servicegeek/db/queries/project/getUsersForProject'
import removeUserFromToProject from '@servicegeek/db/queries/project/removeUserFromProject'
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

  try {
    const { userId } = body as { userId: string }
    const success = await assignUserToProject(user.id, id, userId)
    if (!success) {
      console.error('failed to assign')
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

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
  const projectId = (await params).id
  if (Array.isArray(projectId) || !projectId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }
  try {
    const users = await getUsersForProject(user.id, projectId)
    if (!users) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ users }, { status: 200 })
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}

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
  const id = (await params).id
  if (Array.isArray(id) || !id) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid query param' },
      { status: 400 }
    )
  }

  const body = await req.json()

  try {
    const { userId } = body as { userId: string }
    const success = await removeUserFromToProject(user.id, id, userId)
    if (!success) {
      console.error('failed to remove')
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}