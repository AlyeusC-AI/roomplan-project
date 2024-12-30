import { createClient } from '@lib/supabase/server'
import { prisma } from '@servicegeek/db'

import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest) {
  const headers = req.headers
  const jwt = headers.get('auth-token')
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
  try {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isDeleted: true,
      },
    })

    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}