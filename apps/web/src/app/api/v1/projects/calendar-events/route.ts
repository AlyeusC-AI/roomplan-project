import { createClient } from "@lib/supabase/server"
import getCalendarEvents from "@servicegeek/db/queries/calendar-event/getCalendarEvents"
import { NextRequest, NextResponse } from "next/server"

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
    return NextResponse.json({ status: 'failed', reason: 'invalid query param' }, { status: 400 })
  }
  try {
    const results = await getCalendarEvents({
      userId: user.id,
      projectId,
    })
    if (!results) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }

    return NextResponse.json({ results })
  } catch (err) {
    console.error('err', err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}