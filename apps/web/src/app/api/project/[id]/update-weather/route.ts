import { createClient } from '@lib/supabase/server'
import updateWeatherForProject from '@servicegeek/db/queries/project/updateWeatherForProject'
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

  try {
    const result = await updateWeatherForProject(user.id, id)
    return NextResponse.json({
      status: 'ok',
      weatherData: result,
    }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}