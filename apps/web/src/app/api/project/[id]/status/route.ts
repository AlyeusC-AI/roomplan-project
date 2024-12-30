import { createClient } from '@lib/supabase/server'
import setProjectStatus from '@servicegeek/db/queries/project/setProjectStatus'
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
    const result = await setProjectStatus(user.id, id, body.status)
    // @ts-expect-error
    if (result?.failed) {
      console.log(result)
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    return NextResponse.json({ status: 'ok', result }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
