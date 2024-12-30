import { createClient } from '@lib/supabase/server'
import { prisma } from '@servicegeek/db'

import { DashboardViews } from '@servicegeek/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.error('Session does not exist.')
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  const { preference } = await req.json()

  if (
    preference !== DashboardViews.listView &&
    preference !== DashboardViews.boardView
  ) {
    console.error('Invalid prference')
    return NextResponse.json(
      {
        status: 'failed',
        message: 'Invalid preference',
      },
      { status: 500 }
    )
  }

  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        savedDashboardView: preference,
      },
    })
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }

  return NextResponse.json({ status: 'ok' }, { status: 200 })
}