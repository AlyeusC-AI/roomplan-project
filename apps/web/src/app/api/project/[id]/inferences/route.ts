import { createClient } from '@lib/supabase/server'
import { getInferenceList } from '@servicegeek/db/queries/project/getProjectDetections'
import getUser from '@servicegeek/db/queries/user/getUser'
import { NextRequest, NextResponse } from 'next/server'

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
    return NextResponse.json({  status: 'failed', reason: 'invalid query param' }, { status: 400 })
  }

  try {
    const servicegeekUser = await getUser(user.id)
    const organizationId = servicegeekUser?.org?.organization.id
    if (!organizationId) {
      return NextResponse.json({ status: 'failed' }, { status: 500 })
    }
    const inferenceList = await getInferenceList(projectId, organizationId)
    const inferences = inferenceList?.rooms || []
    return NextResponse.json({ status: 'ok', inferences }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'failed' }, { status: 500 })
  }
}