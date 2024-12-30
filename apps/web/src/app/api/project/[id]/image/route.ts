import { createClient } from '@lib/supabase/server'
import deleteImagesFromProject from '@servicegeek/db/queries/project/deleteImagesFromProject'
import { NextRequest, NextResponse } from 'next/server'

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
      { status: 500 }
    )
  }

  try {
    const { keys } = await req.json()
    if (!keys) {
      return NextResponse.json(
        { status: 'failed', reason: 'keys required' },
        { status: 500 }
      )
    }
    const { failed, reason } = await deleteImagesFromProject(user.id, id, keys)

    if (failed) {
      return NextResponse.json({ status: 'failed', reason }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err: any) {
    if (err.meta?.cause) {
      if (err.meta?.cause === 'Record to delete does not exist.') {
        return NextResponse.json(
          { status: 'failed', reason: 'Could not delete images' },
          { status: 500 }
        )
      }
    }
    console.error(err)

    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}
